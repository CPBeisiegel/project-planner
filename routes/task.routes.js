const router = require("express").Router();
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const isAuth = require("../middlewares/isAuth");

const updateDBDocument = require("../utilities/update");
const isOwner = require("../utilities/isOwner");

const GoalModel = require("../models/Goal.model");
const TaskModel = require("../models/Task.model");

router.post(
  "/create-task/:goalId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const findGoal = await GoalModel.findOne({ _id: req.params.goalId });

      isOwner(findGoal.owner, loggedInUser._id);

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
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

router.patch(
  "/edit-title/:taskId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const taskToUpdate = await TaskModel.findOneAndUpdate(
        { _id: req.params.taskId },
        { title: req.body.title },
        { new: true, runValidators: true }
      );

      return res.status(200).json(taskToUpdate);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

router.patch(
  "/toggle-status/:taskId",
  isAuth,
  attachCurrentUser,
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
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }
);

module.exports = router;
