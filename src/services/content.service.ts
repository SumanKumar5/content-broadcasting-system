import prisma from "../models/prisma";
import {
  RejectContentInput,
  UploadContentInput,
} from "../validations/content.validation";

export const uploadContent = async (
  input: UploadContentInput,
  file: any,
  teacherId: string,
) => {
  const fileUrl =
    (file as any).path ||
    `${process.env.UPLOAD_DIR || "uploads"}/${file.filename}`;

  const content = await prisma.content.create({
    data: {
      title: input.title,
      subject: input.subject.toLowerCase(),
      description: input.description,
      fileUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: teacherId,
      status: "pending",
      startTime: input.startTime ? new Date(input.startTime) : null,
      endTime: input.endTime ? new Date(input.endTime) : null,
    },
  });

  if (input.duration !== undefined) {
    let slot = await prisma.contentSlot.findUnique({
      where: {
        subject_teacherId: {
          subject: input.subject.toLowerCase(),
          teacherId,
        },
      },
    });

    if (!slot) {
      slot = await prisma.contentSlot.create({
        data: {
          subject: input.subject.toLowerCase(),
          teacherId,
        },
      });
    }

    const lastSchedule = await prisma.contentSchedule.findFirst({
      where: { slotId: slot.id },
      orderBy: { rotationOrder: "desc" },
    });

    const nextOrder = lastSchedule ? lastSchedule.rotationOrder + 1 : 1;

    await prisma.contentSchedule.create({
      data: {
        contentId: content.id,
        slotId: slot.id,
        rotationOrder: nextOrder,
        duration: input.duration,
      },
    });
  }

  return content;
};

export const getMyContent = async (
  teacherId: string,
  filters: { subject?: string; status?: string; page?: number; limit?: number },
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = { uploadedBy: teacherId };
  if (filters.subject) where.subject = filters.subject.toLowerCase();
  if (filters.status) where.status = filters.status;

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { schedules: true },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllContent = async (filters: {
  subject?: string;
  teacherId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.subject) where.subject = filters.subject.toLowerCase();
  if (filters.teacherId) where.uploadedBy = filters.teacherId;
  if (filters.status) where.status = filters.status;

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        uploader: { select: { id: true, name: true, email: true } },
        schedules: true,
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPendingContent = async (filters: {
  page?: number;
  limit?: number;
}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where = { status: "pending" as const };

  const [data, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        uploader: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const approveContent = async (
  contentId: string,
  principalId: string,
) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });

  if (!content) throw new Error("Content not found");
  if (content.status !== "pending")
    throw new Error("Only pending content can be approved");

  return prisma.content.update({
    where: { id: contentId },
    data: {
      status: "approved",
      approvedBy: principalId,
      approvedAt: new Date(),
    },
  });
};

export const rejectContent = async (
  contentId: string,
  principalId: string,
  input: RejectContentInput,
) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });

  if (!content) throw new Error("Content not found");
  if (content.status !== "pending")
    throw new Error("Only pending content can be rejected");

  return prisma.content.update({
    where: { id: contentId },
    data: {
      status: "rejected",
      rejectionReason: input.rejectionReason,
      approvedBy: principalId,
    },
  });
};
