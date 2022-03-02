const router = require("express").Router();
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAuth = require("../middlewares/isAuth");

const updateDocument = require("../utility/upupdateDocument");
const isOwner = require("../middlewares/isOwner");

const GoalModel = require("../models/Goal.Model");
const TaskModel = require("../models/Task.Model");

router.post(
  "/:goalId/create-task",
  isAuth,
  attachCurrentUser,
  isOwner,
  async (req, res) => {
    try {
      const task = await TaskModel.create({
        ...req.body,
        goal: req.params.goalId,
      });

      const updateGoal = await GoalModel.findOneAndUpdate(
        { _id: req.params.goalId },
        { $push: { tasks: task } },
        { new: true, runValidators: true }
      ).populate("tasks");

      return res.status(200).json(updateGoal);
    } catch (err) {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json(err.message ? err.message : err);
      }

      res.status(500).json(err);
    }
  }
);

router.patch(
  "/:goalId/edit-title/:taskId",
  isAuth,
  attachCurrentUser,
  isOwner,
  async (req, res) => {
    try {
      const taskToUpdate = await TaskModel.findOneAndUpdate(
        { _id: req.params.taskId },
        { title: req.body.title },
        { new: true, runValidators: true }
      );

      return res.status(200).json(taskToUpdate);
    } catch (err) {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json(err.message ? err.message : err);
      }

      res.status(500).json(err);
    }
  }
);

router.patch(
  "/:goalId/toggle-status/:taskId",
  isAuth,
  attachCurrentUser,
  isOwner,
  async (req, res) => {
    try {
      const taskToEdit = await TaskModel.findOne({ _id: req.params.taskId });

      const taskWithNewStatus = await TaskModel.findByIdAndUpdate(
        {
          _id: req.params.taskId,
        },
        {
          isDone: !taskToEdit.isDone ? true : false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (taskWithNewStatus.isDone === true) {
        const goalToCheck = await GoalModel.findOne({
          _id: taskWithNewStatus.goal,
        }).populate("tasks");

        const goalTasksFilter = goalToCheck.tasks.filter(
          (currentTask) => currentTask.isDone === false
        );

        console.log(goalTasksFilter);

        if (goalTasksFilter.length === 0) {
          const updateGoal = await GoalModel.findOneAndUpdate(
            {
              _id: goalToCheck._id,
            },
            {
              isComplete: true,
            }
          ).populate("tasks");

          return res.status(200).json(updateGoal);
        }
      }

      return res.status(200).json(taskWithNewStatus);
    } catch (err) {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json(err.message ? err.message : err);
      }

      res.status(500).json(err);
    }
  }
);

router.delete(
  "/:goalId/delete-task/:taskId",
  isAuth,
  attachCurrentUser,
  isOwner,
  async (req, res) => {
    try {
      const deleted = await TaskModel.deleteOne({ _id: req.params.taskId });

      return res.status(200).json(deleted);
    } catch (err) {
      console.log(err);

      res.status(500).json(err);
    }
  }
);

module.exports = router;
