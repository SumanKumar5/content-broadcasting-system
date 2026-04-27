import prisma from "../models/prisma";
import redis from "../utils/redis";

interface ScheduledContent {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  fileUrl: string;
  fileType: string;
  startTime: Date | null;
  endTime: Date | null;
  rotationOrder: number;
  duration: number;
}

const getActiveContentForSubject = (
  contents: ScheduledContent[],
  now: Date,
): ScheduledContent | null => {
  const active = contents.filter((c) => {
    if (!c.startTime || !c.endTime) return false;
    return now >= c.startTime && now <= c.endTime;
  });

  if (active.length === 0) return null;

  active.sort((a, b) => a.rotationOrder - b.rotationOrder);

  const totalCycleDuration = active.reduce((sum, c) => sum + c.duration, 0);
  const cycleStart = active[0].startTime!;
  const elapsedMs = now.getTime() - cycleStart.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const positionInCycle = elapsedMinutes % totalCycleDuration;

  let accumulated = 0;
  for (const content of active) {
    accumulated += content.duration;
    if (positionInCycle < accumulated) {
      return content;
    }
  }

  return active[0];
};

export const getLiveContentForTeacher = async (
  teacherId: string,
  subject?: string,
) => {
  const cacheKey = `live:${teacherId}:${subject || "all"}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  const now = new Date();

  const slots = await prisma.contentSlot.findMany({
    where: {
      teacherId,
      ...(subject ? { subject: subject.toLowerCase() } : {}),
    },
    include: {
      schedules: {
        include: { content: true },
      },
    },
  });

  if (slots.length === 0) return null;

  const results: Record<string, ScheduledContent> = {};

  for (const slot of slots) {
    const scheduledContents: ScheduledContent[] = slot.schedules
      .filter((s) => s.content.status === "approved")
      .map((s) => ({
        id: s.content.id,
        title: s.content.title,
        description: s.content.description,
        subject: s.content.subject,
        fileUrl: s.content.fileUrl,
        fileType: s.content.fileType,
        startTime: s.content.startTime,
        endTime: s.content.endTime,
        rotationOrder: s.rotationOrder,
        duration: s.duration,
      }));

    const active = getActiveContentForSubject(scheduledContents, now);
    if (active) {
      results[slot.subject] = active;
    }
  }

  if (Object.keys(results).length === 0) return null;

  try {
    await redis.set(cacheKey, JSON.stringify(results), "EX", 30);
  } catch {}

  return results;
};
