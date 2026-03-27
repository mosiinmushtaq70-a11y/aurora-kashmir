# Windsurf DeepSeek Integration

## Setup Instructions

### 1. Get Your DeepSeek API Key
1. Go to [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .windsurf/.env.example .windsurf/.env
   ```

2. Edit `.windsurf/.env` and replace `your_deepseek_api_key_here` with your actual API key:
   ```
   DEEPSEEK_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Windsurf IDE Configuration
1. Open Windsurf IDE
2. Go to Settings → AI/ML Models
3. Select "Custom Provider"
4. Load configuration from `.windsurf/config.json`
5. Ensure the environment variables are loaded

### 4. Verify Connection
1. Open a new chat in Windsurf
2. Select DeepSeek model
3. Send a test message to verify connectivity

## Model Options
- `deepseek-chat` - General purpose chat model
- `deepseek-coder` - Code-specific model (recommended for development)

## Troubleshooting
- **API Key Error**: Verify your API key is correct and active
- **Connection Error**: Check your internet connection and API status
- **Model Not Found**: Ensure the model name matches DeepSeek's available models

## Security Notes
- Never commit your `.env` file to version control
- Keep your API key secure and don't share it
- Regularly rotate your API keys for security
