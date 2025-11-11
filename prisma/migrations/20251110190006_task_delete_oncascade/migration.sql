-- DropForeignKey
ALTER TABLE "public"."DigitalTask" DROP CONSTRAINT "DigitalTask_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."EcommerceTask" DROP CONSTRAINT "EcommerceTask_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrintTask" DROP CONSTRAINT "PrintTask_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."SpecialTask" DROP CONSTRAINT "SpecialTask_id_fkey";

-- AddForeignKey
ALTER TABLE "PrintTask" ADD CONSTRAINT "PrintTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalTask" ADD CONSTRAINT "DigitalTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceTask" ADD CONSTRAINT "EcommerceTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialTask" ADD CONSTRAINT "SpecialTask_id_fkey" FOREIGN KEY ("id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
