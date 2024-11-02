-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_friends_id_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_group_id_fkey";

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "admin_id" DROP NOT NULL;

-- RenameForeignKey
ALTER TABLE "GroupMembership" RENAME CONSTRAINT "GroupMembership_group_id_fkey" TO "fk__GroupMembership__group_id";

-- RenameForeignKey
ALTER TABLE "GroupMembership" RENAME CONSTRAINT "GroupMembership_user_id_fkey" TO "fk__GroupMembership__user_id";

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_sender_id_fkey" TO "fk__Message__sender_id";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "fk__Group__admin_id" FOREIGN KEY ("admin_id") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "fk__Message__group_id" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "fk__Message__contact_id" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "fk__Contact__user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "fk__Contact__friends_id" FOREIGN KEY ("friends_id") REFERENCES "Users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
