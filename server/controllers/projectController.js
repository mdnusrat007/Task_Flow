const Project = require('../models/Project');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get all projects (admin: all, member: only where they're a member)
// @route   GET /api/projects
// @access  Protected
const getProjects = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { members: req.user._id },
          { createdBy: req.user._id },
        ],
      };
    }

    const projects = await Project.find(query)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Admin only
const createProject = async (req, res) => {
  try {
    const { name, description, deadline, members } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      deadline: deadline || undefined,
      members: members || [],
      createdBy: req.user._id,
    });

    const populated = await project.populate([
      { path: 'members', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Admin only
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { name, description, deadline, members } = req.body;
    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (deadline !== undefined) project.deadline = deadline || undefined;
    if (members !== undefined) project.members = members;

    await project.save();

    const updated = await Project.findById(id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project (also deletes its tasks)
// @route   DELETE /api/projects/:id
// @access  Admin only
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Cascade delete tasks belonging to this project
    await Task.deleteMany({ project: id });
    await project.deleteOne();

    res.json({ message: 'Project and related tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
