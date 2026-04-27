import prisma from "../models/prisma";

export const getSubjectAnalytics = async () => {
  const subjectCounts = await prisma.content.groupBy({
    by: ["subject"],
    _count: { id: true },
    where: { status: "approved" },
    orderBy: { _count: { id: "desc" } },
  });

  const statusBreakdown = await prisma.content.groupBy({
    by: ["subject", "status"],
    _count: { id: true },
  });

  const totalBySubject = await prisma.content.groupBy({
    by: ["subject"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const scheduleUsage = await prisma.contentSchedule.findMany({
    include: {
      content: { select: { subject: true, title: true, status: true } },
      slot: true,
    },
  });

  const usageBySubject: Record<string, number> = {};
  for (const s of scheduleUsage) {
    const subject = s.content.subject;
    usageBySubject[subject] = (usageBySubject[subject] || 0) + 1;
  }

  const mostActiveSubject =
    subjectCounts.length > 0 ? subjectCounts[0].subject : null;

  return {
    mostActiveSubject,
    approvedContentBySubject: subjectCounts.map((s) => ({
      subject: s.subject,
      approvedCount: s._count.id,
    })),
    totalContentBySubject: totalBySubject.map((s) => ({
      subject: s.subject,
      totalCount: s._count.id,
    })),
    statusBreakdown: statusBreakdown.map((s) => ({
      subject: s.subject,
      status: s.status,
      count: s._count.id,
    })),
    scheduledContentBySubject: Object.entries(usageBySubject).map(
      ([subject, count]) => ({ subject, scheduledCount: count }),
    ),
  };
};

export const getTeacherAnalytics = async (teacherId: string) => {
  const total = await prisma.content.count({
    where: { uploadedBy: teacherId },
  });
  const approved = await prisma.content.count({
    where: { uploadedBy: teacherId, status: "approved" },
  });
  const pending = await prisma.content.count({
    where: { uploadedBy: teacherId, status: "pending" },
  });
  const rejected = await prisma.content.count({
    where: { uploadedBy: teacherId, status: "rejected" },
  });

  const bySubject = await prisma.content.groupBy({
    by: ["subject"],
    where: { uploadedBy: teacherId },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return {
    total,
    approved,
    pending,
    rejected,
    bySubject: bySubject.map((s) => ({
      subject: s.subject,
      count: s._count.id,
    })),
  };
};
