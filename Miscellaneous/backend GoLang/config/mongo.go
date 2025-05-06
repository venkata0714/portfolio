package config

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/bsonx/bsontype"
	"go.mongodb.org/mongo-driver/x/bsonx"
)

// Global MongoDB client and database references
var (
	PrimaryDB *DB
	AIDB      *DB

	primaryDbName string
	aiDbName      string

	client *mongo.Client

	// Metrics counters for DB operations
	dbOpsCount       int64
	dbOpsByCollection = struct {
		sync.Mutex
		m map[string]int64
	}{m: make(map[string]int64)}
)

// DB is a wrapper around mongo.Database for adding metrics and easy access to collections.
type DB struct {
	db *mongo.Database
}

// Collection returns a wrapped Collection with metrics tracking for certain operations.
func (d *DB) Collection(name string) *Collection {
	coll := d.db.Collection(name)
	return &Collection{dbName: d.db.Name(), name: name, coll: coll}
}

// Collection is a wrapper around mongo.Collection that increments metrics on DB ops.
type Collection struct {
	dbName string
	name   string
	coll   *mongo.Collection
}

// metricIncrement increments the global counters for a DB operation on this collection.
func (c *Collection) metricIncrement() {
	atomic.AddInt64(&dbOpsCount, 1)
	dbOpsByCollection.Lock()
	dbOpsByCollection.m[c.name] = dbOpsByCollection.m[c.name] + 1
	dbOpsByCollection.Unlock()
}

// Find wraps mongo.Collection.Find and increments metrics.
func (c *Collection) Find(ctx context.Context, filter interface{}, opts ...*options.FindOptions) (*mongo.Cursor, error) {
	c.metricIncrement()
	return c.coll.Find(ctx, filter, opts...)
}

// FindOne wraps mongo.Collection.FindOne and increments metrics.
func (c *Collection) FindOne(ctx context.Context, filter interface{}, opts ...*options.FindOneOptions) *mongo.SingleResult {
	c.metricIncrement()
	return c.coll.FindOne(ctx, filter, opts...)
}

// InsertOne wraps mongo.Collection.InsertOne and increments metrics.
func (c *Collection) InsertOne(ctx context.Context, document interface{}, opts ...*options.InsertOneOptions) (*mongo.InsertOneResult, error) {
	c.metricIncrement()
	return c.coll.InsertOne(ctx, document, opts...)
}

// InsertMany wraps mongo.Collection.InsertMany and increments metrics.
func (c *Collection) InsertMany(ctx context.Context, documents []interface{}, opts ...*options.InsertManyOptions) (*mongo.InsertManyResult, error) {
	c.metricIncrement()
	return c.coll.InsertMany(ctx, documents, opts...)
}

// UpdateOne wraps mongo.Collection.UpdateOne and increments metrics.
func (c *Collection) UpdateOne(ctx context.Context, filter interface{}, update interface{}, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	c.metricIncrement()
	return c.coll.UpdateOne(ctx, filter, update, opts...)
}

// UpdateMany wraps mongo.Collection.UpdateMany and increments metrics.
func (c *Collection) UpdateMany(ctx context.Context, filter interface{}, update interface{}, opts ...*options.UpdateOptions) (*mongo.UpdateResult, error) {
	c.metricIncrement()
	return c.coll.UpdateMany(ctx, filter, update, opts...)
}

// DeleteOne wraps mongo.Collection.DeleteOne and increments metrics.
func (c *Collection) DeleteOne(ctx context.Context, filter interface{}, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error) {
	c.metricIncrement()
	return c.coll.DeleteOne(ctx, filter, opts...)
}

// DeleteMany wraps mongo.Collection.DeleteMany and increments metrics.
func (c *Collection) DeleteMany(ctx context.Context, filter interface{}, opts ...*options.DeleteOptions) (*mongo.DeleteResult, error) {
	c.metricIncrement()
	return c.coll.DeleteMany(ctx, filter, opts...)
}

// CountDocuments wraps mongo.Collection.CountDocuments and increments metrics.
func (c *Collection) CountDocuments(ctx context.Context, filter interface{}, opts ...*options.CountOptions) (int64, error) {
	c.metricIncrement()
	return c.coll.CountDocuments(ctx, filter, opts...)
}

// Aggregate wraps mongo.Collection.Aggregate and increments metrics.
func (c *Collection) Aggregate(ctx context.Context, pipeline interface{}, opts ...*options.AggregateOptions) (*mongo.Cursor, error) {
	c.metricIncrement()
	return c.coll.Aggregate(ctx, pipeline, opts...)
}

// ConnectDB connects to MongoDB using the URI and initializes the primary and AI databases.
func ConnectDB(uri string, dbName string, aiName string) error {
	if uri == "" {
		return fmt.Errorf("MONGO_URI must be provided")
	}
	primaryDbName = dbName
	if primaryDbName == "" {
		primaryDbName = "KartavyaPortfolioDB"
	}
	aiDbName = aiName
	if aiDbName == "" {
		aiDbName = "KartavyaPortfolioDBAI"
	}

	// Setup MongoDB client
	clientOptions := options.Client().ApplyURI(uri)
	var err error
	client, err = mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return fmt.Errorf("MongoDB connection error: %w", err)
	}
	// Ping the database to verify connection
	if err = client.Ping(context.Background(), nil); err != nil {
		return fmt.Errorf("MongoDB ping failed: %w", err)
	}

	// Initialize database wrappers
	PrimaryDB = &DB{db: client.Database(primaryDbName)}
	AIDB = &DB{db: client.Database(aiDbName)}

	log.Printf("✅ Connected to primary DB: %s\n", primaryDbName)
	log.Printf("✅ Connected to AI DB: %s\n", aiDbName)
	return nil
}

// GetDB returns the primary DB instance (for general data).
func GetDB() *DB {
	if PrimaryDB == nil {
		panic("Primary DB is not connected yet. Call ConnectDB first.")
	}
	return PrimaryDB
}

// GetDBAI returns the AI DB instance (for context and memory index data).
func GetDBAI() *DB {
	if AIDB == nil {
		panic("AI DB is not connected yet. Call ConnectDB first.")
	}
	return AIDB
}

// GetPrimaryDBName returns the name of the primary database.
func GetPrimaryDBName() string {
	return primaryDbName
}

// GetAIDBName returns the name of the AI database.
func GetAIDBName() string {
	return aiDbName
}

// GetDBMetrics returns the current database operation metrics (total ops count and per-collection counts).
func GetDBMetrics() (int64, map[string]int64) {
	total := atomic.LoadInt64(&dbOpsCount)
	dbOpsByCollection.Lock()
	// make a copy of the map to avoid race on iterator
	metricsCopy := make(map[string]int64, len(dbOpsByCollection.m))
	for coll, count := range dbOpsByCollection.m {
		metricsCopy[coll] = count
	}
	dbOpsByCollection.Unlock()
	return total, metricsCopy
}

// ResetDBMetrics resets the database operation metrics counters.
func ResetDBMetrics() {
	atomic.StoreInt64(&dbOpsCount, 0)
	dbOpsByCollection.Lock()
	dbOpsByCollection.m = make(map[string]int64)
	dbOpsByCollection.Unlock()
}
