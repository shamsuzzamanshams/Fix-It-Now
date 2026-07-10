import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ReviewPayload } from "./review.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createReviewIntoDB = async (
  userId: string,
  payload: ReviewPayload
) => {

  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Job is not completed yet");
  }

  if (booking.review) {
    throw new AppError(httpStatus.CONFLICT, "Review already submitted");
  }

  const review = await prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        bookingId: booking.id,
        customerId: booking.customerId,
        technicianId: booking.technicianId,
        rating: payload.rating,
        comment: payload.comment,
      },
      include: {
        customer: {
          omit: {
            password: true,
          },
        },
        technician: {
          include: {
            user: {
              omit: {
                password: true,
              },
            },
          },
        },
      },
    });

    const rating = await tx.review.aggregate({
      where: {
        technicianId: booking.technicianId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        averageRating: rating._avg.rating || 0,
      },
    });

    return createdReview;
  });

  return review;
};

export const ReviewService = {
  createReviewIntoDB,
};
