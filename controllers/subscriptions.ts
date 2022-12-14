import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Subscription } from "../models/Subscription";

// @desc    Fetch all subscription for user
// @route   GET /api/v1/subscriptions
// @access  Private
const getSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const subscriptions = await Subscription.find({
    userId: req.user?.id,
  })
    .populate("category")
    .sort({ createdAt: -1 });
  // .populate({
  //    path: 'categoryId',
  //   select: "name"
  //});

  res.status(200).json({
    success: true,
    data: subscriptions,
  });
});

// @desc    Fetch single subscription for user
// @route   GET /api/v1/subscriptions/:id
// @access  Private
const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await Subscription.findById(req.params.id).populate(
    "category"
  );

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  //Make sure user is owner of subscription
  if (subscription.userId?.toString() !== req?.user?.id) {
    res.status(401);
    throw new Error("Not authorized to delete this subscription");
  }

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

// @desc    Create new subsription
// @route   POST /api/v1/subscriptions
// @access  Private
const createSubscription = asyncHandler(
  async (
    req: Request<
      never,
      never,
      {
        name: string;
        icon?: string;
        currency: string;
        cost: number;
        isDisabled?: boolean;
        isFavorite?: boolean;
        firstBill?: string;
        cycleMultiplier?: number;
        cyclePeriod?: "day" | "week" | "month" | "year";
        durationMultiplier?: number;
        durationPeriod?: "forever" | "day" | "week" | "month" | "year";
        remindMe?: number; //days before
        description?: string;
        categoryId?: string;
      },
      never
    >,
    res: Response
  ) => {
    const user = req.user;
    if (!user) {
      res.status(400);
      throw new Error("Not logged in");
    }

    const subscription = await Subscription.create({
      ...req.body,
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      data: subscription,
    });
  }
);

// @desc    Update subscription
// @route   PUT /api/v1/subscriptions/:id
// @access  Private
const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscriptionId = req.params.id;

  const user = req.user;

  if (!user) {
    res.status(400);
    throw new Error("Not logged in");
  }

  const fieldsToUpdate = {
    name: req.body.name,
    icon: req.body.icon,
    currency: req.body.currency,
    cost: req.body.cost,
    isDisabled: req.body.isDisabled,
    isFavorite: req.body.isFavorite,
    firstBill: req.body.firstBill,
    cycleMultiplier: req.body.cycleMultiplier,
    cyclePeriod: req.body.cyclePeriod,
    durationMultiplier: req.body.durationMultiplier,
    durationPeriod: req.body.durationPeriod,
    remindMeBeforeDays: req.body.remindMeBeforeDays,
    description: req.body.description,
    categoryId: req.body.categoryId,
  };

  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: subscription,
  });
});

// @desc    Delete subscription
// @route   DELETE /api/v1/subscriptions/:id
// @access  Private
const deleteSubscription = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Not sure with the id of " + req.params.id);
  }

  //Make sure user is owner of subscription
  if (subscription.userId?.toString() !== req?.user?.id) {
    res.status(401);
    throw new Error("Not authorized to delete this subscription");
  }

  await subscription.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Delete subscriptions
// @route   DELETE /api/v1/subscriptions
// @access  Private
const deleteSubscriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const { subscriptions } = req.body;
    console.log(subscriptions);
    const result = await Subscription.deleteMany({
      _id: { $in: [...subscriptions] },
    });

    res.status(200).json({
      success: result.acknowledged,
      data: result.deletedCount,
    });
  }
);

export {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptions,
  getSubscription,
  deleteSubscriptions,
};
