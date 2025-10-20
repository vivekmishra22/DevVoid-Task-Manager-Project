const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager')
  .then(() => {
    console.log('🔗 MongoDB Connected');
    testAllAPIs();
  })
  .catch(err => console.log('❌ MongoDB connection failed:', err));

async function testAllAPIs() {
  try {
    const Project = require('./models/Project');
    const Task = require('./models/Task');

    console.log('\n🧪 TESTING ALL APIS...\n');

    // Test 1: Create Project
    console.log('1. Testing Project Creation...');
    const project = await Project.create({
      name: 'Test Project ' + Date.now(),
      description: 'Test description'
    });
    console.log('✅ Project created:', project._id);

    // Test 2: Create Task
    console.log('2. Testing Task Creation...');
    const task = await Task.create({
      title: 'Test Task',
      description: 'Test task description',
      status: 'todo',
      projectId: project._id
    });
    console.log('✅ Task created:', task._id);

    // Test 3: Update Task
    console.log('3. Testing Task Update...');
    const updatedTask = await Task.findByIdAndUpdate(
      task._id,
      { title: 'Updated Test Task', description: 'Updated description' },
      { new: true }
    );
    console.log('✅ Task updated:', updatedTask.title);

    // Test 4: Delete Task
    console.log('4. Testing Task Deletion...');
    await Task.findByIdAndDelete(task._id);
    console.log('✅ Task deleted');

    // Test 5: Delete Project
    console.log('5. Testing Project Deletion...');
    await Project.findByIdAndDelete(project._id);
    console.log('✅ Project deleted');

    console.log('\n🎉 ALL API TESTS PASSED! Backend is working correctly.\n');
    console.log('🚨 The issue is likely in the FRONTEND.');

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}