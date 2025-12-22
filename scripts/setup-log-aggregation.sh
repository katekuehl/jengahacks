#!/bin/bash
# Interactive setup script for log aggregation
# Helps configure log aggregation services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Log Aggregation Setup${NC}"
echo "=========================="
echo ""
echo "This script will help you set up log aggregation for JengaHacks Hub."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        touch .env
    fi
fi

# Provider selection
echo "Select log aggregation provider:"
echo "  1) Logtail (Better Stack) - Recommended"
echo "  2) Datadog"
echo "  3) LogDNA"
echo "  4) Custom endpoint"
echo "  5) Skip (disable aggregation)"
echo ""
read -p "Enter choice [1-5]: " PROVIDER_CHOICE

case $PROVIDER_CHOICE in
    1)
        PROVIDER="logtail"
        DEFAULT_ENDPOINT="https://in.logtail.com"
        ;;
    2)
        PROVIDER="datadog"
        DEFAULT_ENDPOINT="https://http-intake.logs.datadoghq.com/api/v2/logs"
        ;;
    3)
        PROVIDER="logdna"
        DEFAULT_ENDPOINT="https://logs.logdna.com/logs/ingest"
        ;;
    4)
        PROVIDER="custom"
        read -p "Enter custom endpoint URL: " DEFAULT_ENDPOINT
        ;;
    5)
        echo -e "${YELLOW}Skipping log aggregation setup.${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Skipping.${NC}"
        exit 0
        ;;
esac

if [ "$PROVIDER" != "none" ]; then
    echo ""
    echo -e "${BLUE}Configuration:${NC}"
    read -p "Endpoint URL [$DEFAULT_ENDPOINT]: " ENDPOINT
    ENDPOINT=${ENDPOINT:-$DEFAULT_ENDPOINT}
    
    read -p "API Key: " API_KEY
    if [ -z "$API_KEY" ]; then
        echo -e "${YELLOW}⚠️  API key is required. Skipping setup.${NC}"
        exit 1
    fi
    
    read -p "Source name [jengahacks-hub]: " SOURCE
    SOURCE=${SOURCE:-jengahacks-hub}
    
    read -p "Enable batching? [Y/n]: " BATCHING
    BATCHING=${BATCHING:-Y}
    
    if [ "$BATCHING" = "Y" ] || [ "$BATCHING" = "y" ]; then
        BATCHING_ENABLED="true"
        read -p "Batch size [10]: " BATCH_SIZE
        BATCH_SIZE=${BATCH_SIZE:-10}
        
        read -p "Flush interval (ms) [5000]: " FLUSH_INTERVAL
        FLUSH_INTERVAL=${FLUSH_INTERVAL:-5000}
    else
        BATCHING_ENABLED="false"
        BATCH_SIZE="10"
        FLUSH_INTERVAL="5000"
    fi
    
    # Update .env file
    echo ""
    echo -e "${GREEN}Updating .env file...${NC}"
    
    # Remove existing log aggregation settings
    sed -i.bak '/^VITE_LOG_AGGREGATION_/d' .env 2>/dev/null || true
    
    # Add new settings
    cat >> .env << EOF

# Log Aggregation Configuration
VITE_LOG_AGGREGATION_ENABLED=true
VITE_LOG_AGGREGATION_PROVIDER=$PROVIDER
VITE_LOG_AGGREGATION_ENDPOINT=$ENDPOINT
VITE_LOG_AGGREGATION_API_KEY=$API_KEY
VITE_LOG_AGGREGATION_SOURCE=$SOURCE
VITE_LOG_AGGREGATION_BATCH_SIZE=$BATCH_SIZE
VITE_LOG_AGGREGATION_FLUSH_INTERVAL=$FLUSH_INTERVAL
VITE_LOG_AGGREGATION_BATCHING=$BATCHING_ENABLED
EOF
    
    echo ""
    echo -e "${GREEN}✅ Client-side configuration complete!${NC}"
    echo ""
    
    # Edge Function setup
    echo -e "${BLUE}Edge Function Setup:${NC}"
    echo "To set up server-side log forwarding, configure Edge Function secrets:"
    echo ""
    echo "  supabase secrets set LOG_AGGREGATION_PROVIDER=$PROVIDER"
    echo "  supabase secrets set ${PROVIDER^^}_ENDPOINT=$ENDPOINT"
    echo "  supabase secrets set ${PROVIDER^^}_API_KEY=$API_KEY"
    echo "  supabase secrets set ENVIRONMENT=production"
    echo ""
    read -p "Configure Edge Function secrets now? [y/N]: " CONFIGURE_EDGE
    
    if [ "$CONFIGURE_EDGE" = "y" ] || [ "$CONFIGURE_EDGE" = "Y" ]; then
        if command -v supabase &> /dev/null; then
            echo ""
            echo "Setting Edge Function secrets..."
            supabase secrets set LOG_AGGREGATION_PROVIDER=$PROVIDER || echo "⚠️  Failed to set LOG_AGGREGATION_PROVIDER"
            
            if [ "$PROVIDER" = "logtail" ]; then
                supabase secrets set LOGTAIL_ENDPOINT=$ENDPOINT || echo "⚠️  Failed to set LOGTAIL_ENDPOINT"
                supabase secrets set LOGTAIL_API_KEY=$API_KEY || echo "⚠️  Failed to set LOGTAIL_API_KEY"
            elif [ "$PROVIDER" = "datadog" ]; then
                supabase secrets set DATADOG_ENDPOINT=$ENDPOINT || echo "⚠️  Failed to set DATADOG_ENDPOINT"
                supabase secrets set DATADOG_API_KEY=$API_KEY || echo "⚠️  Failed to set DATADOG_API_KEY"
            fi
            
            supabase secrets set ENVIRONMENT=production || echo "⚠️  Failed to set ENVIRONMENT"
            
            echo ""
            echo -e "${GREEN}✅ Edge Function secrets configured!${NC}"
        else
            echo -e "${YELLOW}⚠️  Supabase CLI not found. Install it with: npm install -g supabase${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Log aggregation setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Restart your development server"
    echo "  2. Check your aggregation service dashboard for incoming logs"
    echo "  3. Review LOG_AGGREGATION.md for advanced configuration"
    echo ""
else
    echo -e "${YELLOW}Log aggregation disabled.${NC}"
fi

