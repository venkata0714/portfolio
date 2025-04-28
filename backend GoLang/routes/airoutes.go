package routes

import (
	"net/http"

	"example.com/portfolio-backend/controllers"
	"github.com/gin-gonic/gin"
)

// RegisterAiRoutes sets up all AI-related endpoints under /api/ai.
func RegisterAiRoutes(router *gin.RouterGroup) {
	// Basic test endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "AI Routes are working!"})
	})
	// Trigger manual (re)creation of context index and memory index
	router.GET("/create-index", handleCreateIndex)
	router.POST("/create-index", handleCreateIndex)
	// Ask a question to the AI using indexed context
	router.POST("/ask-chat", func(c *gin.Context) {
		var req struct {
			Query string `json:"query"`
		}
		if err := c.BindJSON(&req); err != nil || req.Query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Query cannot be empty"})
			return
		}
		answer, err := controllers.AskLLM(req.Query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusOK, gin.H{"answer": answer})
		}
	})
	// Get suggested follow-up questions
	router.POST("/suggestFollowUpQuestions", func(c *gin.Context) {
		var req struct {
			Query              string `json:"query"`
			Response           string `json:"response"`
			ConversationMemory string `json:"conversationMemory"`
		}
		if err := c.BindJSON(&req); err != nil || req.Query == "" || req.Response == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Both query and response are required"})
			return
		}
		suggestions, err := controllers.SuggestFollowUpQuestions(req.Query, req.Response, req.ConversationMemory)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusOK, gin.H{"suggestions": suggestions})
		}
	})
	// Update conversation memory snapshot
	router.POST("/snapshotMemoryUpdate", func(c *gin.Context) {
		var req struct {
			PreviousMemory string `json:"previousMemory"`
			Query          string `json:"query"`
			Response       string `json:"response"`
		}
		if err := c.BindJSON(&req); err != nil || req.Query == "" || req.Response == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Query and response are required"})
			return
		}
		updatedMemory, err := controllers.SnapshotMemoryUpdate(req.PreviousMemory, req.Query, req.Response)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusOK, gin.H{"memory": updatedMemory})
		}
	})
	// Optimize a query for better retrieval
	router.POST("/optimize-query", func(c *gin.Context) {
		var req struct {
			Query              string `json:"query"`
			ConversationMemory string `json:"conversationMemory"`
		}
		if err := c.BindJSON(&req); err != nil || req.Query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Query is required"})
			return
		}
		optimized, err := controllers.OptimizeQuery(req.ConversationMemory, req.Query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusOK, gin.H{"optimizedQuery": optimized})
		}
	})
}

// handleCreateIndex triggers context file updates and memory index rebuild.
func handleCreateIndex(c *gin.Context) {
	if err := controllers.InitContext(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "Context files updated and memory index built successfully."})
	}
}
