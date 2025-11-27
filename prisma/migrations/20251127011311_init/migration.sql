-- CreateTable
CREATE TABLE "Calendar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "backgroundUrl" TEXT,
    "password" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "defaultStyle" TEXT NOT NULL DEFAULT 'circle',
    "defaultColor" TEXT NOT NULL DEFAULT '#dc2626',
    "defaultTextColor" TEXT NOT NULL DEFAULT '#ffffff',
    "defaultSize" DOUBLE PRECISION NOT NULL DEFAULT 6.5,
    "defaultFontSize" DOUBLE PRECISION NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "content" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "style" TEXT NOT NULL DEFAULT 'circle',
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "size" DOUBLE PRECISION,
    "fontSize" DOUBLE PRECISION,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "calendarId" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayOpen" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DayOpen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_slug_key" ON "Calendar"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Day_calendarId_dayNumber_key" ON "Day"("calendarId", "dayNumber");

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayOpen" ADD CONSTRAINT "DayOpen_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
