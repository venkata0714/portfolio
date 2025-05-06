package main

import (
	"fmt"
	"log"
	"os"
	"regexp"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"example.com/portfolio-backend/config"
	"example.com/portfolio-backend/controllers"
	"example.com/portfolio-backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load environment variables from .env file if present
	if err := config.InitOpenAI(); err != nil {
		log.Fatal(err)
	}
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB_NAME")
	aiDbName := os.Getenv("MONGO_DB_NAME_AI")
	if err := config.ConnectDB(mongoURI, dbName, aiDbName); err != nil {
		log.Fatal(err)
	}
	// Initialize AI context (load/update snapshots and memory index)
	if err := controllers.InitContext(); err != nil {
		log.Fatal("AI context initialization failed:", err)
	}
	// Setup Gin router with appropriate middleware
	router := gin.New()
	// Global middleware: CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://kartavya-portfolio-mern-frontend.onrender.com",
			"https://kartavya-singh.com",
			"http://localhost:3000",
			"http://localhost:3001",
		},
		AllowCredentials: true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	}))
	// Optionally set a maximum body size (50 MB as in Node)
	router.Use(func(c *gin.Context) {
		if c.Request.ContentLength > 50*1024*1024 {
			c.AbortWithStatusJSON(413, gin.H{"message": "Request too large"})
			return
		}
		c.Next()
	})

	// Attach metrics middleware to track requests and responses
	router.Use(requestMetricsMiddleware)

	// Define API routes
	apiGroup := router.Group("/api")
	routes.RegisterDataRoutes(apiGroup)
	aiGroup := router.Group("/api/ai")
	routes.RegisterAiRoutes(aiGroup)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Printf("🚀 Server listening on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server error:", err)
	}
}

// requestMetricsMiddleware measures request latency, collects metrics and logs hourly stats.
func requestMetricsMiddleware(c *gin.Context) {
	// before request
	start := time.Now()
	c.Next()
	// after response
	latency := time.Since(start).Seconds() * 1000.0 // in milliseconds
	// Collect route metrics
	route := c.FullPath()
	if route == "" {
		route = c.Request.URL.Path
	}
	status := c.Writer.Status()
	ip := c.ClientIP()
	uaString := c.Request.UserAgent()
	ua := useragent.New(uaString)
	device := ua.Platform()
	if device == "" {
		device = ua.OS()
	}
	browserName, _ := ua.Browser()
	if browserName == "" {
		browserName = ua.Name()
	}
	// Update global metrics counters
	atomic.AddInt64(&totalApiCalls, 1)
	metricsMu.Lock()
	totalApiCallsCount := totalApiCalls // snapshot
	uniqueIPsSet[ip] = struct{}{}
	// Update route stats
	stats, exists := routeStats[route]
	if !exists {
		stats = &RouteStat{
			methods:    make(map[string]struct{}),
			statusCodes: make(map[int]struct{}),
			ips:        make(map[string]struct{}),
			devices:    make(map[string]struct{}),
			browsers:   make(map[string]struct{}),
		}
		routeStats[route] = stats
	}
	stats.count++
	stats.methods[c.Request.Method] = struct{}{}
	stats.statusCodes[status] = struct{}{}
	stats.ips[ip] = struct{}{}
	if device == "" {
		device = "Unknown"
	}
	if browserName == "" {
		browserName = "Unknown"
	}
	stats.devices[device] = struct{}{}
	stats.browsers[browserName] = struct{}{}
	stats.totalLatency += latency
	metricsMu.Unlock()
}

// Setup metrics structures
var totalApiCalls int64
var uniqueIPsSet = make(map[string]struct{})
type RouteStat struct {
	count       int
	methods     map[string]struct{}
	statusCodes map[int]struct{}
	ips         map[string]struct{}
	devices     map[string]struct{}
	browsers    map[string]struct{}
	totalLatency float64
}
var routeStats = make(map[string]*RouteStat)
var metricsMu sync.Mutex

// Hourly metrics logging goroutine
func init() {
	go func() {
		prevUserTime, prevSysTime := getCPUUsage()
		startTime := time.Now()
		for {
			time.Sleep(time.Hour)
			// Snapshot metrics
			metricsMu.Lock()
			totalCalls := totalApiCalls
			uniqueIPCount := len(uniqueIPsSet)
			// Compute average memory usage
			memStats := runtime.MemStats{}
			runtime.ReadMemStats(&memStats)
			avgRSS := float64(memStats.Sys)   // total bytes of memory obtained from OS
			avgHeap := float64(memStats.HeapAlloc)
			totalHeap := float64(memStats.HeapSys)
			rssPct := 0.0
			if totalMem := getTotalSystemMemory(); totalMem > 0 {
				rssPct = (avgRSS / float64(totalMem)) * 100
			}
			heapPct := 0.0
			if totalHeap > 0 {
				heapPct = (avgHeap / totalHeap) * 100
			}
			// CPU usage since last log
			currUserTime, currSysTime := getCPUUsage()
			userDelta := currUserTime - prevUserTime
			sysDelta := currSysTime - prevSysTime
			cpuPct := ((userDelta + sysDelta) / 1e9 / 3600) * 100 // userDelta & sysDelta in nanoseconds
			prevUserTime, prevSysTime = currUserTime, currSysTime
			// Active handles (no direct equivalent in Go, use goroutines as rough measure)
			handles := runtime.NumGoroutine()
			uptimeSec := int(time.Since(startTime).Seconds())
			// DB metrics
			dbOpsCount, dbOpsByColl := config.GetDBMetrics()
			// Find top collection by ops
			topColl := ""
			maxOps := int64(0)
			for coll, ops := range dbOpsByColl {
				if ops > maxOps {
					maxOps = ops
					topColl = coll
				}
			}
			log.Println("----- Hourly Metrics -----")
			log.Printf("API Calls: %d | Unique IPs: %d | RSS: %.2f%% | Heap: %.2f%% | CPU: %.2f%% | Goroutines: %d | Uptime: %ds",
				totalCalls, uniqueIPCount, rssPct, heapPct, cpuPct, handles, uptimeSec)
			log.Printf("DB Conns: N/A | Ops: %d | DB Uptime: N/A | Storage: N/A | TopColl: %s(%d)",
				dbOpsCount, topColl, maxOps)
			log.Println("Endpoints:")
			if len(routeStats) == 0 {
				log.Println("  (no calls)")
			} else {
				// Print header
				log.Println("Route                           Cnt   Methods      Sts  IPs Dev        Brw        AvgLat")
				for route, st := range routeStats {
					// Join method and status sets
					methodList := joinSet(st.methods)
					statusList := joinIntSet(st.statusCodes)
					avgLat := 0.0
					if st.count > 0 {
						avgLat = st.totalLatency / float64(st.count)
					}
					log.Printf("%-30s %-5d %-12s %-5s %-4d %-10s %-10s %.2fms",
						route, st.count, methodList, statusList, len(st.ips),
						joinSet(st.devices), joinSet(st.browsers), avgLat)
				}
			}
			// Reset metrics for next interval
			totalApiCalls = 0
			uniqueIPsSet = make(map[string]struct{})
			routeStats = make(map[string]*RouteStat)
			config.ResetDBMetrics()
			metricsMu.Unlock()
		}
	}()
}

// Utility: get CPU usage times for current process (user + system) in nanoseconds.
func getCPUUsage() (userTimeNS, sysTimeNS int64) {
	var ru syscall.Rusage
	if err := syscall.Getrusage(syscall.RUSAGE_SELF, &ru); err == nil {
		userTimeNS = ru.Utime.Sec*1e9 + int64(ru.Utime.Usec)*1e3
		sysTimeNS = ru.Stime.Sec*1e9 + int64(ru.Stime.Usec)*1e3
	}
	return
}

// Utility: get total system memory (for calculating RSS percentage)
func getTotalSystemMemory() uint64 {
	if data, err := os.ReadFile("/proc/meminfo"); err == nil {
		re := regexp.MustCompile(`MemTotal:\s+(\d+) kB`)
		if match := re.FindSubmatch(data); match != nil {
			totalKb, _ := strconv.ParseUint(string(match[1]), 10, 64)
			return totalKb * 1024
		}
	}
	return 0
}

// Helpers to join set of strings or ints to comma-separated string
func joinSet(m map[string]struct{}) string {
	parts := []string{}
	for k := range m {
		parts = append(parts, k)
	}
	sort.Strings(parts)
	return strings.Join(parts, ",")
}
func joinIntSet(m map[int]struct{}) string {
	parts := []int{}
	for k := range m {
		parts = append(parts, k)
	}
	sort.Ints(parts)
	strParts := []string{}
	for _, v := range parts {
		strParts = append(strParts, fmt.Sprintf("%d", v))
	}
	return strings.Join(strParts, ",")
}
