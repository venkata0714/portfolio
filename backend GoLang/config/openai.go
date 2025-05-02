package config

import (
	"fmt"
	"os"

	openai "github.com/sashabaranov/go-openai"
)

// OpenAIClient is the global client for OpenAI API.
var OpenAIClient *openai.Client

// InitOpenAI initializes the OpenAI client using the API key from environment.
func InitOpenAI() error {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("OPENAI_API_KEY must be set in .env")
	}
	OpenAIClient = openai.NewClient(apiKey)
	return nil
}
