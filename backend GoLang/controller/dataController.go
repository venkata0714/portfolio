package controllers

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"example.com/portfolio-backend/config"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Utility: getObjectID converts a string id to a MongoDB ObjectID (or timestamp ObjectID if numeric).
func getObjectID(idStr string) (primitive.ObjectID, error) {
	// If the id is all digits, treat it as a timestamp (seconds) for ObjectID
	if idStr != "" && strings.Trim(idStr, "0123456789") == "" {
		sec, err := strconv.ParseInt(idStr, 10, 64)
		if err == nil {
			return primitive.NewObjectIDFromTimestamp(time.Unix(sec, 0)), nil
		}
	}
	// Otherwise, try to parse as hex ObjectID
	return primitive.ObjectIDFromHex(idStr)
}

// Caching for images
var mustLoadImagesCache = struct {
	data        []string
	lastUpdated int64
}{}
var dynamicImagesCache = struct {
	data        []string
	lastUpdated int64
}{}

// Initialize image caches and schedule updates every 12 hours
func init() {
	updateMustLoadImagesCache()
	updateDynamicImagesCache()
	// Schedule caches to update periodically (12 hours)
	ticker := time.NewTicker(12 * time.Hour)
	go func() {
		for range ticker.C {
			updateMustLoadImagesCache()
			updateDynamicImagesCache()
		}
	}()
}

// updateMustLoadImagesCache loads the static list of image URLs into cache.
func updateMustLoadImagesCache() {
	mustLoadImages := []string{
		"/home-bg.jpg",
		"/Kartavya.jpg",
		"/Kartavya-Profile-Photo.jpg",
		"/contact-bg.png",
		"/system-user.jpg",
		"/user-icon.svg",
	}
	mustLoadImagesCache.data = append([]string{}, mustLoadImages...)
	mustLoadImagesCache.lastUpdated = time.Now().Unix()
	log.Printf("Must-load images cache updated at %s", time.Now().Format(time.RFC1123))
}

// updateDynamicImagesCache queries database fields to collect dynamic image URLs.
func updateDynamicImagesCache() {
	ctx := context.Background()
	db := config.GetDB()
	collections := []struct {
		Name string
		Field string
	}{
		{"experienceTable", "experienceImages"},
		{"honorsExperienceTable", "honorsExperienceImages"},
		{"involvementTable", "involvementImages"},
		{"projectTable", "projectImages"},
		{"yearInReviewTable", "yearInReviewImages"},
		{"FeedTable", "feedImageURL"},
	}
	var dynamicURLs []string
	for _, col := range collections {
		cur, err := db.Collection(col.Name).Find(ctx, bson.M{col.Field: bson.M{"$exists": true}})
		if err != nil {
			log.Printf("Error querying %s for dynamic images: %v", col.Name, err)
			continue
		}
		var docs []bson.M
		if err = cur.All(ctx, &docs); err != nil {
			log.Printf("Error loading results for %s: %v", col.Name, err)
			continue
		}
		for _, doc := range docs {
			val, ok := doc[col.Field]
			if !ok {
				continue
			}
			// If field is array of images, use first; if string, use it
			if urls, ok := val.([]interface{}); ok && len(urls) > 0 {
				if str, ok := urls[0].(string); ok && str != "" {
					dynamicURLs = append(dynamicURLs, str)
				}
			} else if str, ok := val.(string); ok && str != "" {
				dynamicURLs = append(dynamicURLs, str)
			}
		}
	}
	// Remove duplicates
	urlSet := make(map[string]struct{})
	for _, u := range dynamicURLs {
		urlSet[u] = struct{}{}
	}
	uniqueList := make([]string, 0, len(urlSet))
	for u := range urlSet {
		uniqueList = append(uniqueList, u)
	}
	dynamicImagesCache.data = uniqueList
	dynamicImagesCache.lastUpdated = time.Now().Unix()
	log.Printf("Dynamic images cache updated at %s", time.Now().Format(time.RFC1123))
}

// Helper to fetch all documents from a collection (excluding soft-deleted).
func getAllDocuments(ctx context.Context, collectionName string) ([]bson.M, error) {
	db := config.GetDB()
	cur, err := db.Collection(collectionName).Find(ctx, bson.M{"deleted": bson.M{"$ne": true}})
	if err != nil {
		return nil, err
	}
	var docs []bson.M
	err = cur.All(ctx, &docs)
	return docs, err
}

// Helper to fetch a single document by link field (excluding soft-deleted).
func getDocumentByLink(ctx context.Context, collectionName string, linkField string, linkValue string) (bson.M, error) {
	db := config.GetDB()
	var result bson.M
	err := db.Collection(collectionName).FindOne(ctx, bson.M{
		linkField: linkValue,
		"deleted": bson.M{"$ne": true},
	}).Decode(&result)
	return result, err
}

// Clear cached data for a collection (called after modifications).
func clearCacheForCollection(collectionName string) {
	// If data was cached for this collection via getCachedAllDocuments, remove it
	if cached, ok := cachedCollections[collectionName]; ok && cached {
		delete(cachedCollections, collectionName)
	}
}

// In-memory cache for full collection fetches
var cachedCollections = make(map[string]bool)
var collectionCacheData = make(map[string][]bson.M)

// getCachedAllDocuments returns all documents for a collection, using cache if available.
func getCachedAllDocuments(ctx context.Context, collectionName string) ([]bson.M, error) {
	if data, ok := collectionCacheData[collectionName]; ok && cachedCollections[collectionName] {
		// cached data exists
		return data, nil
	}
	docs, err := getAllDocuments(ctx, collectionName)
	if err != nil {
		return nil, err
	}
	collectionCacheData[collectionName] = docs
	cachedCollections[collectionName] = true
	log.Printf("Loaded and cached data for collection: %s", collectionName)
	return docs, nil
}

// -- Handlers for API Endpoints: --

// CheckCookie (in routes, defined inline with VerifyJWT middleware) – no separate controller needed.

// Ping and DB-Ping are defined inline in routes as well.

// Must-load static images
func GetMustLoadImages(c *gin.Context) {
	if mustLoadImagesCache.data == nil {
		updateMustLoadImagesCache()
	}
	c.JSON(http.StatusOK, mustLoadImagesCache.data)
}

// Dynamic images
func GetDynamicImages(c *gin.Context) {
	if dynamicImagesCache.data == nil {
		updateDynamicImagesCache()
	}
	c.JSON(http.StatusOK, dynamicImagesCache.data)
}

// Projects:
func GetProjects(c *gin.Context) {
	ctx := c.Request.Context()
	projects, err := getCachedAllDocuments(ctx, "projectTable")
	if err != nil {
		log.Println("Error fetching projects:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from projectTable"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func GetProjectByLink(c *gin.Context) {
	ctx := c.Request.Context()
	projectLink := c.Param("projectLink")
	project, err := getDocumentByLink(ctx, "projectTable", "projectLink", projectLink)
	if err == nil && project != nil {
		c.JSON(http.StatusOK, project)
	} else if err == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "project not found"})
	} else {
		log.Println("Error fetching project by link:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching document by link from projectTable"})
	}
}

func AddProject(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid project data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("projectTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding project:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding project"})
		return
	}
	// Clear relevant caches
	clearCacheForCollection("projectTable")
	// Respond with success and new item (with _id)
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Project added.",
		"newItem": item,
	})
}

func UpdateProject(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid project id format"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid project data"})
		return
	}
	// Remove any _id in update data
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("projectTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating project:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating project"})
		return
	}
	clearCacheForCollection("projectTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Project updated."})
}

func DeleteProject(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid project id format"})
		return
	}
	db := config.GetDB()
	// Soft delete: mark deleted true
	_, err = db.Collection("projectTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting project:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting project"})
		return
	}
	clearCacheForCollection("projectTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Project soft deleted."})
}

// (The pattern is similar for other collections: Involvements, Experiences, YearInReviews, HonorsExperiences, Skills, SkillComponents, Feeds, etc.)

// Involvements:
func GetInvolvements(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "involvementTable")
	if err != nil {
		log.Println("Error fetching involvements:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from involvementTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func GetInvolvementByLink(c *gin.Context) {
	ctx := c.Request.Context()
	link := c.Param("involvementLink")
	doc, err := getDocumentByLink(ctx, "involvementTable", "involvementLink", link)
	if err == nil && doc != nil {
		c.JSON(http.StatusOK, doc)
	} else if err == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "involvement not found"})
	} else {
		log.Println("Error fetching involvement by link:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching document by link from involvementTable"})
	}
}
func AddInvolvement(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid involvement data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("involvementTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding involvement:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding involvement"})
		return
	}
	clearCacheForCollection("involvementTable")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Involvement added.", "newItem": item})
}
func UpdateInvolvement(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid involvement id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid involvement data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("involvementTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating involvement:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating involvement"})
		return
	}
	clearCacheForCollection("involvementTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Involvement updated."})
}
func DeleteInvolvement(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid involvement id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("involvementTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting involvement:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting involvement"})
		return
	}
	clearCacheForCollection("involvementTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Involvement soft deleted."})
}

// Experiences (similar structure) ...
func GetExperiences(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "experienceTable")
	if err != nil {
		log.Println("Error fetching experiences:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from experienceTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func GetExperienceByLink(c *gin.Context) {
	ctx := c.Request.Context()
	link := c.Param("experienceLink")
	doc, err := getDocumentByLink(ctx, "experienceTable", "experienceLink", link)
	if err == nil && doc != nil {
		c.JSON(http.StatusOK, doc)
	} else if err == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "experience not found"})
	} else {
		log.Println("Error fetching experience by link:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching document by link from experienceTable"})
	}
}
func AddExperience(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("experienceTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding experience"})
		return
	}
	clearCacheForCollection("experienceTable")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Experience added.", "newItem": item})
}
func UpdateExperience(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("experienceTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating experience"})
		return
	}
	clearCacheForCollection("experienceTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Experience updated."})
}
func DeleteExperience(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid experience id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("experienceTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting experience"})
		return
	}
	clearCacheForCollection("experienceTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Experience soft deleted."})
}

// YearInReviews (similar structure)
func GetYearInReviews(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "yearInReviewTable")
	if err != nil {
		log.Println("Error fetching year in reviews:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from yearInReviewTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func GetYearInReviewByLink(c *gin.Context) {
	ctx := c.Request.Context()
	link := c.Param("yearInReviewLink")
	doc, err := getDocumentByLink(ctx, "yearInReviewTable", "yearInReviewLink", link)
	if err == nil && doc != nil {
		c.JSON(http.StatusOK, doc)
	} else if err == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "yearInReview not found"})
	} else {
		log.Println("Error fetching year in review by link:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching document by link from yearInReviewTable"})
	}
}
func AddYearInReview(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year in review data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("yearInReviewTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding year in review:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding year in review"})
		return
	}
	clearCacheForCollection("yearInReviewTable")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Year in Review added.", "newItem": item})
}
func UpdateYearInReview(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year in review id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year in review data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("yearInReviewTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating year in review:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating year in review"})
		return
	}
	clearCacheForCollection("yearInReviewTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Year in Review updated."})
}
func DeleteYearInReview(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid year in review id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("yearInReviewTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting year in review:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting year in review"})
		return
	}
	clearCacheForCollection("yearInReviewTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Year in Review soft deleted."})
}

// HonorsExperiences (similar to Experiences)
func GetHonorsExperiences(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "honorsExperienceTable")
	if err != nil {
		log.Println("Error fetching honors experiences:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from honorsExperienceTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func GetHonorsExperienceByLink(c *gin.Context) {
	ctx := c.Request.Context()
	link := c.Param("honorsExperienceLink")
	doc, err := getDocumentByLink(ctx, "honorsExperienceTable", "honorsExperienceLink", link)
	if err == nil && doc != nil {
		c.JSON(http.StatusOK, doc)
	} else if err == nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "honorsExperience not found"})
	} else {
		log.Println("Error fetching honors experience by link:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching document by link from honorsExperienceTable"})
	}
}
func AddHonorsExperience(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid honors experience data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("honorsExperienceTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding honors experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding honors experience"})
		return
	}
	clearCacheForCollection("honorsExperienceTable")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Honors experience added.", "newItem": item})
}
func UpdateHonorsExperience(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid honors experience id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid honors experience data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("honorsExperienceTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating honors experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating honors experience"})
		return
	}
	clearCacheForCollection("honorsExperienceTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Honors experience updated."})
}
func DeleteHonorsExperience(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid honors experience id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("honorsExperienceTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting honors experience:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting honors experience"})
		return
	}
	clearCacheForCollection("honorsExperienceTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Honors experience soft deleted."})
}

// Skills and SkillComponents:
func GetSkills(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "skillsCollection")
	if err != nil {
		log.Println("Error fetching skills:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from skillsCollection"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func GetSkillComponents(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "skillsTable")
	if err != nil {
		log.Println("Error fetching skill components:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from skillsTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func AddSkill(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("skillsCollection").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding skill:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding skill"})
		return
	}
	clearCacheForCollection("skillsCollection")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill added.", "newItem": item})
}
func UpdateSkill(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("skillsCollection").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating skill:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating skill"})
		return
	}
	clearCacheForCollection("skillsCollection")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill updated."})
}
func DeleteSkill(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("skillsCollection").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting skill:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting skill"})
		return
	}
	clearCacheForCollection("skillsCollection")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill soft deleted."})
}
func AddSkillComponent(c *gin.Context) {
	ctx := c.Request.Context()
	var item bson.M
	if err := c.BindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill component data"})
		return
	}
	db := config.GetDB()
	res, err := db.Collection("skillsTable").InsertOne(ctx, item)
	if err != nil {
		log.Println("Error adding skill component:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding skill component"})
		return
	}
	clearCacheForCollection("skillsTable")
	item["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill component added.", "newItem": item})
}
func UpdateSkillComponent(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill component id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill component data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("skillsTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating skill component:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating skill component"})
		return
	}
	clearCacheForCollection("skillsTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill component updated."})
}
func DeleteSkillComponent(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid skill component id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("skillsTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"deleted": true}})
	if err != nil {
		log.Println("Error deleting skill component:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting skill component"})
		return
	}
	clearCacheForCollection("skillsTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Skill component soft deleted."})
}

// Feeds (simplified similar logic):
func GetFeeds(c *gin.Context) {
	ctx := c.Request.Context()
	docs, err := getCachedAllDocuments(ctx, "FeedTable")
	if err != nil {
		log.Println("Error fetching feeds:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching documents from FeedTable"})
		return
	}
	c.JSON(http.StatusOK, docs)
}
func AddFeed(c *gin.Context) {
	ctx := c.Request.Context()
	var reqBody struct {
		FeedTitle    string        `json:"feedTitle"`
		FeedCategory string        `json:"feedCategory"`
		FeedContent  []interface{} `json:"feedContent"`
		FeedImageURL string        `json:"feedImageURL"`
		FeedLinks    []interface{} `json:"feedLinks"`
	}
	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid feed data"})
		return
	}
	if reqBody.FeedTitle == "" || reqBody.FeedCategory == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "feedTitle and feedCategory are required"})
		return
	}
	newFeed := bson.M{
		"feedTitle":     reqBody.FeedTitle,
		"feedCategory":  reqBody.FeedCategory,
		"feedContent":   reqBody.FeedContent,
		"feedImageURL":  reqBody.FeedImageURL,
		"feedLinks":     reqBody.FeedLinks,
		"feedCreatedAt": time.Now().Format(time.RFC3339),
	}
	db := config.GetDB()
	res, err := db.Collection("FeedTable").InsertOne(ctx, newFeed)
	if err != nil {
		log.Println("Error adding feed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error adding feed"})
		return
	}
	clearCacheForCollection("FeedTable")
	newFeed["_id"] = res.InsertedID
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Feed added successfully.", "newItem": newFeed})
}
func EditFeed(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid feed id"})
		return
	}
	var updateData bson.M
	if err := c.BindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid feed data"})
		return
	}
	delete(updateData, "_id")
	db := config.GetDB()
	_, err = db.Collection("FeedTable").UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": updateData})
	if err != nil {
		log.Println("Error updating feed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error updating feed"})
		return
	}
	clearCacheForCollection("FeedTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Feed updated."})
}
func DeleteFeed(c *gin.Context) {
	ctx := c.Request.Context()
	id := c.Param("id")
	objID, err := getObjectID(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid feed id"})
		return
	}
	db := config.GetDB()
	_, err = db.Collection("FeedTable").DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		log.Println("Error deleting feed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error deleting feed"})
		return
	}
	clearCacheForCollection("FeedTable")
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Feed deleted."})
}

// Likes:
func AddLike(c *gin.Context) {
	ctx := c.Request.Context()
	var reqBody struct {
		Type  string `json:"type"`
		Title string `json:"title"`
	}
	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid like data"})
		return
	}
	t := reqBody.Type
	title := reqBody.Title
	if t == "" || title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Both 'type' and 'title' are required"})
		return
	}
	// Map type to collection and title field
	typeMapping := map[string]struct {
		Collection string
		TitleField string
	}{
		"Project":      {"projectTable", "projectTitle"},
		"Experience":   {"experienceTable", "experienceTitle"},
		"Involvement":  {"involvementTable", "involvementTitle"},
		"Honors":       {"honorsExperienceTable", "honorsExperienceTitle"},
		"YearInReview": {"yearInReviewTable", "yearInReviewTitle"},
		"Feed":         {"FeedTable", "feedTitle"},
	}
	mapping, ok := typeMapping[t]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid type provided"})
		return
	}
	db := config.GetDB()
	filter := bson.M{mapping.TitleField: title, "deleted": bson.M{"$ne": true}}
	update := bson.M{"$inc": bson.M{"likesCount": 1}}
	res, err := db.Collection(mapping.Collection).UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("Error in addLike:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Server error while adding like"})
		return
	}
	if res.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "Document not found or cannot be updated"})
		return
	}
	clearCacheForCollection(mapping.Collection)
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Like added successfully"})
}

// Admin Management:
func SetAdminCredentials(c *gin.Context) {
	ctx := c.Request.Context()
	var reqBody struct {
		UserName        string `json:"userName"`
		Password        string `json:"password"`
		CurrentPassword string `json:"currentPassword"`
	}
	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid admin credential data"})
		return
	}
	db := config.GetDB()
	// Fetch current admin record
	var admin bson.M
	err := db.Collection("KartavyaPortfolio").FindOne(ctx, bson.M{}).Decode(&admin)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Admin not found."})
		return
	}
	// Verify current password
	// (In Node, they store hashed username and password. We assume those are hashed and use bcrypt comparison.)
	currentHash, _ := admin["password"].(string)
	if !checkPasswordHash(reqBody.CurrentPassword, currentHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Current password is incorrect."})
		return
	}
	// Hash new credentials and replace record
	newUserHash, _ := hashPassword(reqBody.UserName)
	newPassHash, _ := hashPassword(reqBody.Password)
	_, err = db.Collection("KartavyaPortfolio").DeleteMany(ctx, bson.M{})
	if err == nil {
		_, err = db.Collection("KartavyaPortfolio").InsertOne(ctx, bson.M{"userName": newUserHash, "password": newPassHash})
	}
	if err != nil {
		log.Println("Error setting admin credentials:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error setting credentials"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Admin credentials set."})
}

// (The compareAdminName, compareAdminPassword, compareOTP, logoutAdmin functions are not explicitly needed in Go since JWT covers authentication. 
// If needed, they can be implemented by verifying provided name/password against hashed values and issuing OTP and JWT similarly to Node logic.)
