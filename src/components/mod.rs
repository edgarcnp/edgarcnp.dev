mod footer;
pub use footer::Footer;

mod navbar;
pub use navbar::Navbar;

mod shared;
pub use shared::{
    ActionSize, ActionVariant, BlueprintBackground, BlueprintDiagram, BlueprintFrame,
    BreakpointStrip, CapabilityGrid, ContactEndpoint, LinkAction, ProjectCard, RouteAction,
    SectionHeading, StatusBadge, TechTag,
};
#[allow(unused_imports)]
pub use shared::{
    ArticleSkeleton, CapabilityGridSkeleton, ContactEndpointSkeleton, ContactListSkeleton,
    HomeSkeleton, NavSkeleton, ProjectCardSkeleton, ProjectDetailSkeleton, ProjectGridSkeleton,
    ProjectStatsSkeleton, SectionHeadingSkeleton, SkeletonBlock, SkeletonText, WritingCardSkeleton,
    WritingListSkeleton, WritingPostSkeleton,
};

pub mod ui;
