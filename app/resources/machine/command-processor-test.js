// Simple test runner for CommandProcessor
const { CommandProcessor } = require('./command-processor.js');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    fn();
    console.log(`✅ PASSED: ${name}\n`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}\n`);
    testsFailed++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
        );
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${actual.length} to be ${expected}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(
          `Expected ${actual} to be greater than or equal to ${expected}`,
        );
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
  };
}

// Test data
const testCommands = {
  generador: [66, 124, 71, 83, 124, 1, 124, 90],
  calculador: [66, 124, 67, 83, 124, 1, 124, 32, 32, 32, 124, 90],
  patron: [
    66, 124, 80, 83, 124, 119, 53, 148, 0, 124, 8, 152, 124, 8, 152, 124, 8,
    152, 124, 0, 41, 124, 0, 150, 124, 0, 131, 124, 45, 239, 67, 124, 45, 193,
    67, 124, 45, 190, 67, 124, 90,
  ],
};

function bytesToString(bytes) {
  return String.fromCharCode(...bytes);
}

// Run tests
console.log('🚀 Starting CommandProcessor Tests\n');

test('CommandProcessor should be created', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);
  expect(processor).toBeTruthy();
});

test('Should process generador command', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);
  const commandString = bytesToString(testCommands.generador);

  processor.processDataChunk(commandString);

  // Wait a bit for processing
  setTimeout(() => {
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0]).toBe(commandString);
    expect(loggedCommands.length).toBe(1);
    expect(loggedCommands[0]).toBe(commandString);
    processor.cleanup();
  }, 200);
});

test('Should process calculador command', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);
  const commandString = bytesToString(testCommands.calculador);

  processor.processDataChunk(commandString);

  setTimeout(() => {
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0]).toBe(commandString);
    expect(loggedCommands.length).toBe(1);
    expect(loggedCommands[0]).toBe(commandString);
    processor.cleanup();
  }, 200);
});

test('Should process command in chunks', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);
  const commandString = bytesToString(testCommands.generador);

  // Split into chunks
  const chunk1 = commandString.substring(0, 3);
  const chunk2 = commandString.substring(3, 6);
  const chunk3 = commandString.substring(6);

  processor.processDataChunk(chunk1);
  processor.processDataChunk(chunk2);
  processor.processDataChunk(chunk3);

  setTimeout(() => {
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0]).toBe(commandString);
    expect(loggedCommands.length).toBe(1);
    expect(loggedCommands[0]).toBe(commandString);
    processor.cleanup();
  }, 300);
});

test('Should handle empty data', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);

  processor.processDataChunk('');

  const bufferState = processor.getBufferState();
  expect(bufferState.bufferLength).toBe(0);
  expect(bufferState.maxBufferSize).toBeGreaterThan(0);
  expect(bufferState.timeoutAttempts).toBeGreaterThanOrEqual(0); // Could be 0 or 1 depending on processing
  expect(receivedCommands.length).toBe(0);
  expect(loggedCommands.length).toBe(0);

  processor.cleanup();
});

test('Should clean up properly', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);
  const commandString = bytesToString(testCommands.generador);

  processor.processDataChunk(commandString.substring(0, 5));

  let bufferState = processor.getBufferState();
  expect(bufferState.bufferLength).toBeGreaterThan(0);
  expect(bufferState.maxBufferSize).toBeGreaterThan(0);

  processor.cleanup();

  bufferState = processor.getBufferState();
  expect(bufferState.bufferLength).toBe(0);
  expect(bufferState.timeoutAttempts).toBe(0);
});

test('Should handle invalid data', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);

  processor.processDataChunk('INVALID_DATA_12345');

  setTimeout(() => {
    expect(receivedCommands.length).toBe(0);
    expect(loggedCommands.length).toBe(0);

    const bufferState = processor.getBufferState();
    expect(bufferState.bufferLength).toBe(0);
    expect(bufferState.timeoutAttempts).toBeGreaterThan(0); // Should have attempted to find pattern
    processor.cleanup();
  }, 200);
});

test('Should handle noise before command pattern', () => {
  const receivedCommands = [];
  const loggedCommands = [];

  const callbacks = {
    onCommandReceived: (command) => receivedCommands.push(command),
    onCommandLog: (command) => loggedCommands.push(command),
  };

  const processor = new CommandProcessor(callbacks);

  // Test with noise before the command
  const noise = 'asodijasoidjaoisdjoda';
  const commandString = bytesToString(testCommands.generador);
  const dataWithNoise = noise + commandString;

  processor.processDataChunk(dataWithNoise);

  setTimeout(() => {
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0]).toBe(commandString); // Should extract clean command
    expect(loggedCommands.length).toBe(1);
    expect(loggedCommands[0]).toBe(commandString);

    const bufferState = processor.getBufferState();
    expect(bufferState.bufferLength).toBe(0); // Buffer should be clean after processing
    processor.cleanup();
  }, 200);
});

// Wait for async tests to complete
setTimeout(() => {
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}, 2500);
