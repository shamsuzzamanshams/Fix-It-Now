import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ReviewPayload } from "./review.interface";

const createReviewIntoDB = async (
  userId: string,
  payload: ReviewPayload
) => {

  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: payload.bookingId,
    },
    include: {
      review: true,
    },
  });

  if (booking.customerId !== userId) {
    throw new Error("Unauthorized");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("Job is not completed yet");
  }

  if (booking.review) {
    throw new Error("Review already submitted");
  }

  const review = await prisma.review.create({
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

  return review;
};

export const ReviewService = {
  createReviewIntoDB,
};