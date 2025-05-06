package routes

import (
	"example.com/portfolio-backend/controllers"
	"github.com/gin-gonic/gin"
)

// RegisterDataRoutes sets up all the data-related endpoints under /api.
func RegisterDataRoutes(router *gin.RouterGroup) {
	// Protected route to check JWT cookie
	router.GET("/check-cookie", controllers.VerifyJWT, func(c *gin.Context) {
		userVal, _ := c.Get("user")
		c.JSON(200, gin.H{
			"message": "Protected Cookie. Logged In as Admin!",
			"valid":   true,
			"user":    userVal,
		})
	})
	// Health check routes
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Backend is active"})
	})
	router.GET("/db-ping", func(c *gin.Context) {
		// Simple query to test DB connection
		db := controllers.GetDB()  // use controllers or config to get DB
		err := db.Collection("someCollection").FindOne(c.Request.Context(), gin.H{}).Err()
		if err != nil && err.Error() != "mongo: no documents in result" {
			c.JSON(500, gin.H{"message": "MongoDB is not connected", "error": err.Error()})
		} else {
			c.JSON(200, gin.H{"message": "MongoDB is active"})
		}
	})

	// Image routes
	router.GET("/must-load-images", controllers.GetMustLoadImages)
	router.GET("/dynamic-images", controllers.GetDynamicImages)

	// Project routes
	router.GET("/getprojects", controllers.GetProjects)
	router.GET("/getprojects/:projectLink", controllers.GetProjectByLink)
	router.POST("/addproject", controllers.VerifyJWT, controllers.AddProject)
	router.PUT("/updateproject/:id", controllers.VerifyJWT, controllers.UpdateProject)
	router.DELETE("/deleteproject/:id", controllers.VerifyJWT, controllers.DeleteProject)

	// Involvement routes
	router.GET("/getinvolvements", controllers.GetInvolvements)
	router.GET("/getinvolvements/:involvementLink", controllers.GetInvolvementByLink)
	router.POST("/addinvolvement", controllers.VerifyJWT, controllers.AddInvolvement)
	router.PUT("/updateinvolvement/:id", controllers.VerifyJWT, controllers.UpdateInvolvement)
	router.DELETE("/deleteinvolvement/:id", controllers.VerifyJWT, controllers.DeleteInvolvement)

	// Experience routes
	router.GET("/getexperiences", controllers.GetExperiences)
	router.GET("/getexperiences/:experienceLink", controllers.GetExperienceByLink)
	router.POST("/addexperience", controllers.VerifyJWT, controllers.AddExperience)
	router.PUT("/updateexperience/:id", controllers.VerifyJWT, controllers.UpdateExperience)
	router.DELETE("/deleteexperience/:id", controllers.VerifyJWT, controllers.DeleteExperience)

	// YearInReview routes
	router.GET("/getyearinreviews", controllers.GetYearInReviews)
	router.GET("/getyearinreviews/:yearInReviewLink", controllers.GetYearInReviewByLink)
	router.POST("/addyearinreview", controllers.VerifyJWT, controllers.AddYearInReview)
	router.PUT("/updateyearinreview/:id", controllers.VerifyJWT, controllers.UpdateYearInReview)
	router.DELETE("/deleteyearinreview/:id", controllers.VerifyJWT, controllers.DeleteYearInReview)

	// HonorsExperience routes
	router.GET("/gethonorsexperiences", controllers.GetHonorsExperiences)
	router.GET("/gethonorsexperiences/:honorsExperienceLink", controllers.GetHonorsExperienceByLink)
	router.POST("/addhonorsexperience", controllers.VerifyJWT, controllers.AddHonorsExperience)
	router.PUT("/updatehonorsexperience/:id", controllers.VerifyJWT, controllers.UpdateHonorsExperience)
	router.DELETE("/deletehonorsexperience/:id", controllers.VerifyJWT, controllers.DeleteHonorsExperience)

	// Skills routes
	router.GET("/getskills", controllers.GetSkills)
	router.GET("/getskillcomponents", controllers.GetSkillComponents)
	router.POST("/addskill", controllers.VerifyJWT, controllers.AddSkill)
	router.PUT("/updateskill/:id", controllers.VerifyJWT, controllers.UpdateSkill)
	router.DELETE("/deleteskill/:id", controllers.VerifyJWT, controllers.DeleteSkill)
	router.POST("/addskillcomponent", controllers.VerifyJWT, controllers.AddSkillComponent)
	router.PUT("/updateskillcomponent/:id", controllers.VerifyJWT, controllers.UpdateSkillComponent)
	router.DELETE("/deleteskillcomponent/:id", controllers.VerifyJWT, controllers.DeleteSkillComponent)

	// Feed routes
	router.GET("/getFeeds", controllers.GetFeeds)
	router.POST("/addFeed", controllers.VerifyJWT, controllers.AddFeed)
	router.PUT("/updateFeed/:id", controllers.VerifyJWT, controllers.EditFeed)
	router.DELETE("/deleteFeed/:id", controllers.VerifyJWT, controllers.DeleteFeed)
	router.POST("/addLike", controllers.AddLike)

	// Admin routes
	router.POST("/setAdminCredentials", controllers.VerifyJWT, controllers.SetAdminCredentials)
	// (compareAdminName, compareAdminPassword, compareOTP, logout are not implemented here as JWT covers login)
	router.GET("/logout", func(c *gin.Context) {
		// Clear token cookie
		c.SetCookie("token", "", -1, "/", "", true, true)
		c.JSON(200, gin.H{"success": true, "message": "Logged out successfully!"})
	})

	// Collection counts (for metrics page maybe)
	router.GET("/collection-counts", func(c *gin.Context) {
		// Count documents in each collection
		db := controllers.GetDB()
		collections := []string{
			"skillsCollection", "skillsTable", "projectTable", "experienceTable",
			"involvementTable", "honorsExperienceTable", "yearInReviewTable",
			"KartavyaPortfolio", "FeedTable",
		}
		result := make(map[string]int64)
		for _, name := range collections {
			count, err := db.Collection(name).CountDocuments(c.Request.Context(), gin.H{"deleted": gin.H{"$ne": true}})
			if err != nil {
				result[name] = -1
			} else {
				result[name] = count
			}
		}
		c.JSON(200, result)
	})
}
