// pages/admin/ManageNewPage.tsx
import IndustryVideos from "@/admin/intro-video/industry-video";
import NewPageIntro from "@/admin/intro-video/newpage-intro";
import FeedbackImages from "@/admin/intro-video/feedback-images";

export default function ManageNewPage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <NewPageIntro />
      <IndustryVideos />
      <FeedbackImages />
    </div>
  );
}
