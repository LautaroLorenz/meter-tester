#!/bin/bash

echo "🧪 Running CommandProcessor Tests..."
echo "=========================================="

# Navigate to the machine directory
cd /home/ubuntu/Documents/Git/meter-tester/app/resources/machine

# Compile TypeScript to JavaScript
echo "📦 Compiling TypeScript..."
npx tsc command-processor.ts --target es2017 --module commonjs --esModuleInterop --skipLibCheck

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
    echo ""
    
    # Run the command processor test
    echo "🚀 Running tests..."
    node command-processor-test.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 All tests passed!"
    else
        echo ""
        echo "❌ Some tests failed!"
        exit 1
    fi
else
    echo "❌ TypeScript compilation failed!"
    exit 1
fi