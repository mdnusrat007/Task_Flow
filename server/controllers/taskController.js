const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get tasks
//          Admin: all tasks | Member: only assigned tasks
// @route   GET /api/tasks
// @access  Protected
const getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id;
    }

    // Optional filters from query string
    if (req.query.status) query.status = req.query.status;
    if (req.query.project && mongoose.Types.ObjectId.isValid(req.query.project)) {
      query.project = req.query.project;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, project, status, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Validate optional ObjectId fields
    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: 'Invalid assignedTo user ID' });
    }
    if (project && !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      assignedTo: assignedTo || undefined,
      project: project || undefined,
      status: status || 'Todo',
      deadline: deadline || undefined,
      createdBy: req.user._id,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'project', select: 'name' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
//          Admin: full update | Member: status only (own tasks)
// @route   PUT /api/tasks/:id
// @access  Protected
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'admin') {
      // Admin can update everything
      const { title, description, assignedTo, project, status, deadline } = req.body;
      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
      if (project !== undefined) task.project = project || undefined;
      if (status !== undefined) task.status = status;
      if (deadline !== undefined) task.deadline = deadline || undefined;
    } else {
      // Member: can only update status, and only for their own tasks
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      if (!isAssigned) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();

    const updated = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Admin only
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
