# GitHub PR Generator

## Application Overview
This application is an AI-powered GitHub Pull Request generator that uses OpenAI (GPT-4o) and Anthropic (Claude) to analyze repositories and automatically generate code changes based on user prompts.

## Key Features
- Analyzes GitHub repositories through their API
- Uses AI to understand codebases and implement requested changes
- Supports both OpenAI and Anthropic/Claude with fallback mechanisms
- Handles large repositories through chunking techniques
- Provides detailed progress updates during PR generation

## Setup Instructions

### Prerequisites
- Node.js v18+ with npm
- OpenAI API key (starts with "sk-")
- GitHub personal access token with repo scope
- Optional: Anthropic API key for fallback support

### Local Development
1. Clone the repository
2. Run `npm install` to install dependencies
3. Start the application with `npm run dev`
4. Access the UI at http://localhost:5000

## Usage
Enter a GitHub repository URL, your API keys, and a prompt describing the changes you want. The system will:
1. Analyze the repository structure
2. Identify relevant files for modification
3. Generate code changes based on your requirements
4. Create a pull request with the changes

This README was generated as a fallback since no files were successfully modified based on your request: "Please add a readme that provides instructions on how to get this app up and running on my local mac"