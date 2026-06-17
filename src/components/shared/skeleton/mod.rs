mod article;
mod capability;
mod contact;
mod home;
mod navigation;
mod primitive;
mod project;
mod section;
mod writing;

pub use article::ArticleSkeleton;
pub use capability::CapabilityGridSkeleton;
pub use contact::{ContactEndpointSkeleton, ContactListSkeleton};
pub use home::HomeSkeleton;
pub use navigation::NavSkeleton;
pub use primitive::{SkeletonBlock, SkeletonText};
pub use project::{
    ProjectCardSkeleton, ProjectDetailSkeleton, ProjectGridSkeleton, ProjectStatsSkeleton,
};
pub use section::SectionHeadingSkeleton;
pub use writing::{WritingCardSkeleton, WritingListSkeleton, WritingPostSkeleton};
