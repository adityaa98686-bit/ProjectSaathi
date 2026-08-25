import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_CURRENT_USER, 
  SEED_CANDIDATES, 
  INITIAL_PROJECTS, 
  INITIAL_APPLICATIONS,
  INITIAL_INVITATIONS
} from './data/mockData';
import { 
  UserProfile, 
  Project, 
  Application, 
  AvailabilityStatus,
  RecruitmentStatus,
  ProjectInvitation
} from './types';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { ContributorDashboard } from './components/ContributorDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { PostProjectModal } from './components/PostProjectModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ApplicationsTracker } from './components/ApplicationsTracker';
import { InvitationsModal } from './components/InvitationsModal';
import { AuthModal } from './components/AuthModal';
import { computeMatchScore } from './utils/matchingEngine';

export default function App() {
  // Navigation & Mode State
  const [viewState, setViewState] = useState<'landing' | 'app'>('landing');
  const [appMode, setAppMode] = useState<'joining' | 'building'>('joining');
  const [authMode, setAuthMode] = useState<'demo' | 'registered'>('demo');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('projectsaathi_auth_user');
    } catch {
      return false;
    }
  });

  // Core Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CURRENT_USER);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(SEED_CANDIDATES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(INITIAL_INVITATIONS);

  // Modals & Drawers
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile | null>(null);
  const [isPostProjectOpen, setIsPostProjectOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState<boolean>(false);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'register' | 'login' | 'demo'>('register');

  // Toast alert notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load any previously saved registered user on initial mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('projectsaathi_auth_user');
      const savedUsersList = localStorage.getItem('projectsaathi_all_users');
      
      if (savedUsersList) {
        const parsedList = JSON.parse(savedUsersList);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          setAllUsers(parsedList);
        }
      }

      if (savedAuth) {
        const parsedUser = JSON.parse(savedAuth);
        if (parsedUser && parsedUser.id) {
          setCurrentUser(parsedUser);
          setAuthMode('registered');
          setIsLoggedIn(true);
        }
      }
    } catch {}
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Auth Gateway with specific tab
  const handleOpenAuth = (tab: 'register' | 'login' | 'demo' = 'register') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Registration Handler
  const handleRegisterUser = (newUser: UserProfile) => {
    const updatedUsers = [newUser, ...allUsers.filter((u) => u.email !== newUser.email)];
    setCurrentUser(newUser);
    setAllUsers(updatedUsers);
    setAuthMode('registered');
    setIsLoggedIn(true);
    setViewState('app');
    
    try {
      localStorage.setItem('projectsaathi_auth_user', JSON.stringify(newUser));
      localStorage.setItem('projectsaathi_all_users', JSON.stringify(updatedUsers));
    } catch {}

    triggerToast(`🎉 Welcome to ProjectSaathi, ${newUser.name}! Your matching profile is active.`);
    
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Login Handler
  const handleLoginUser = (email: string) => {
    const foundUser = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      setAuthMode('registered');
      setIsLoggedIn(true);
      setViewState('app');
      try {
        localStorage.setItem('projectsaathi_auth_user', JSON.stringify(foundUser));
      } catch {}
      triggerToast(`Welcome back, ${foundUser.name}!`);
    } else {
      // Create registered profile for this email
      const newRegistered: UserProfile = {
        ...INITIAL_CURRENT_USER,
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace(/[\.\_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        joinedDate: 'Joined Today',
      };
      const updatedUsers = [newRegistered, ...allUsers];
      setCurrentUser(newRegistered);
      setAllUsers(updatedUsers);
      setAuthMode('registered');
      setIsLoggedIn(true);
      setViewState('app');
      try {
        localStorage.setItem('projectsaathi_auth_user', JSON.stringify(newRegistered));
        localStorage.setItem('projectsaathi_all_users', JSON.stringify(updatedUsers));
      } catch {}
      triggerToast(`Logged in as ${newRegistered.name}`);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Select Demo Persona
  const handleSelectDemoUser = (demoUser: UserProfile) => {
    setCurrentUser(demoUser);
    setAuthMode('demo');
    setIsLoggedIn(true);
    setViewState('app');
    try {
      localStorage.removeItem('projectsaathi_auth_user');
    } catch {}
    triggerToast(`⚡ Active as ${demoUser.name} (${demoUser.primaryRole})`);
  };

  // Logout Handler
  const handleLogout = () => {
    setAuthMode('demo');
    setIsLoggedIn(false);
    setCurrentUser(INITIAL_CURRENT_USER);
    setViewState('landing');
    try {
      localStorage.removeItem('projectsaathi_auth_user');
    } catch {}
    triggerToast('Logged out successfully.');
  };

  // Switch Active Test User
  const handleSwitchUser = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    triggerToast(`Switched active companion to ${newUser.name} (${newUser.primaryRole})`);
  };

  // Update Availability Status Globally
  const handleUpdateAvailability = (status: AvailabilityStatus) => {
    const updated = { ...currentUser, availability: status };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    try {
      if (authMode === 'registered') {
        localStorage.setItem('projectsaathi_auth_user', JSON.stringify(updated));
      }
    } catch {}
    triggerToast(`Availability set to "${status.replace(/_/g, ' ')}"`);
  };

  // Save/Update Profile
  const handleSaveProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    try {
      if (authMode === 'registered') {
        localStorage.setItem('projectsaathi_auth_user', JSON.stringify(updated));
      }
    } catch {}
    triggerToast('Profile & skills updated successfully!');
  };

  // Post New Project
  const handleSaveProject = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setAppMode('building');
    setViewState('app');
    triggerToast(`Project "${newProject.title}" published!`);
    
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // Apply to Project
  const handleSubmitApplication = (
    projectId: string,
    roleId: string,
    roleTitle: string,
    note: string
  ) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Guard: Owner cannot apply to own project
    if (project.ownerId === currentUser.id || project.owner.email.toLowerCase() === currentUser.email.toLowerCase()) {
      triggerToast('Project owners manage recruitment and cannot apply to their own open positions.');
      return;
    }

    if (project.recruitmentStatus === 'paused') {
      triggerToast('Recruitment is currently paused by the project owner.');
      return;
    }

    if (project.recruitmentStatus === 'closed') {
      triggerToast('Recruitment for this project is concluded (squad full).');
      return;
    }

    const matchBreakdown = computeMatchScore(currentUser, project, roleId);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      projectId,
      projectTitle: project.title,
      projectDomain: project.domain,
      applicantId: currentUser.id,
      applicant: currentUser,
      roleId,
      roleTitle,
      note,
      status: 'pending',
      appliedAt: 'Just now',
      updatedAt: 'Just now',
      matchScore: matchBreakdown.overallScore,
      matchBreakdown,
    };

    setApplications([newApp, ...applications]);
    triggerToast(`Application submitted with ${matchBreakdown.overallScore}% compatibility match!`);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Accept Applicant to Project Team (Owner Mode)
  const handleAcceptApplicant = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    // 1. Update application status to 'accepted'
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'accepted' as const, updatedAt: 'Just now' } : app
      )
    );

    // 2. Add member to project team
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === targetApp.projectId) {
          const isAlreadyInTeam = proj.team.some((m) => m.userId === targetApp.applicantId);
          if (isAlreadyInTeam) return proj;

          const updatedTeam = [
            ...proj.team,
            {
              userId: targetApp.applicantId,
              user: targetApp.applicant,
              roleTitle: targetApp.roleTitle,
              joinedAt: 'Just now',
            },
          ];

          // Decrement remaining open role spot
          const updatedRoles = proj.openRoles.map((r) =>
            r.id === targetApp.roleId ? { ...r, filled: Math.min(r.spots, r.filled + 1) } : r
          );

          return {
            ...proj,
            team: updatedTeam,
            openRoles: updatedRoles,
          };
        }
        return proj;
      })
    );

    triggerToast(`Accepted ${targetApp.applicant.name} to the team! Team radar updated.`);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Waitlist Applicant
  const handleWaitlistApplicant = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'waitlisted' as const, updatedAt: 'Just now' } : app
      )
    );
    triggerToast('Applicant placed on the project waitlist.');
  };

  // Decline Applicant
  const handleDeclineApplicant = (applicationId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: 'declined' as const, updatedAt: 'Just now' } : app
      )
    );
    triggerToast('Applicant status updated to declined.');
  };

  // Remove Applicant completely
  const handleRemoveApplicant = (applicationId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (targetApp && targetApp.status === 'accepted') {
      handleRemoveTeamMember(targetApp.projectId, targetApp.applicantId);
    }
    setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    triggerToast('Applicant removed from project list.');
  };

  // Remove Team Member from squad (re-opens role spot)
  const handleRemoveTeamMember = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const memberToRemove = proj.team.find((m) => m.userId === userId);
          const updatedTeam = proj.team.filter((m) => m.userId !== userId);

          // Reopen spot in openRoles
          const updatedRoles = proj.openRoles.map((role) => {
            if (memberToRemove && role.title.toLowerCase() === memberToRemove.roleTitle.toLowerCase()) {
              return { ...role, filled: Math.max(0, role.filled - 1) };
            }
            return role;
          });

          return {
            ...proj,
            team: updatedTeam,
            openRoles: updatedRoles,
          };
        }
        return proj;
      })
    );

    // Update accepted application to declined so owner can re-recruit
    setApplications((prev) =>
      prev.map((app) =>
        app.projectId === projectId && app.applicantId === userId && app.status === 'accepted'
          ? { ...app, status: 'declined' as const, updatedAt: 'Just now' }
          : app
      )
    );

    triggerToast('Team member removed from squad. Open role spot reopened!');
  };

  // Update Project Recruitment Status (active / paused / closed)
  const handleUpdateProjectStatus = (projectId: string, status: RecruitmentStatus) => {
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === projectId ? { ...proj, recruitmentStatus: status } : proj
      )
    );
    triggerToast(`Recruitment status updated to "${status.toUpperCase()}".`);
  };

  // Direct Invite Candidate to Project
  const handleInviteCandidate = (
    candidateId: string, 
    projectId: string, 
    roleTitle: string = 'Squad Companion', 
    note: string = ''
  ) => {
    const candidate = allUsers.find((u) => u.id === candidateId);
    const project = projects.find((p) => p.id === projectId);
    if (!candidate || !project) return;

    const matchBreakdown = computeMatchScore(candidate, project);
    const targetRole = project.openRoles.find((r) => r.title === roleTitle) || project.openRoles[0];

    const newApp: Application = {
      id: `app-invite-${Date.now()}`,
      projectId,
      projectTitle: project.title,
      projectDomain: project.domain,
      applicantId: candidate.id,
      applicant: candidate,
      roleId: targetRole?.id || 'invited-role',
      roleTitle: targetRole?.title || roleTitle,
      note: note || `Personal invitation sent to ${candidate.name} for ${roleTitle}`,
      status: 'pending',
      appliedAt: 'Invited just now',
      updatedAt: 'Just now',
      matchScore: matchBreakdown.overallScore,
      matchBreakdown,
    };

    const newInvitation: ProjectInvitation = {
      id: `inv-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      projectTagline: project.tagline,
      projectDomain: project.domain,
      projectLogo: project.logo,
      ownerId: project.ownerId,
      owner: project.owner,
      candidateId: candidate.id,
      candidate: candidate,
      roleId: targetRole?.id || 'invited-role',
      roleTitle: targetRole?.title || roleTitle,
      initialNote: note || `Hi ${candidate.name.split(' ')[0]}, I reviewed your skills and would love to invite you to join our squad as ${roleTitle}!`,
      status: 'pending',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      matchScore: matchBreakdown.overallScore,
      matchBreakdown,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: project.ownerId,
          senderName: project.owner.name,
          senderAvatar: project.owner.avatar,
          text: note || `Hi ${candidate.name.split(' ')[0]}! I'd love to invite you to join ${project.title} as our ${roleTitle}. Feel free to accept, save for later, or ask me any questions here!`,
          timestamp: 'Just now',
          isOwner: true,
        }
      ]
    };

    setApplications((prev) => [newApp, ...prev]);
    setInvitations((prev) => [newInvitation, ...prev]);
    triggerToast(`🎉 Direct invitation dispatched to ${candidate.name}!`);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Accept Project Invitation (Candidate action)
  const handleAcceptInvitation = (invitationId: string) => {
    const targetInv = invitations.find((i) => i.id === invitationId);
    if (!targetInv) return;

    // 1. Update invitation status
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: 'accepted' as const, updatedAt: 'Just now' }
          : inv
      )
    );

    // 2. Add user to project team and update role spots
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === targetInv.projectId) {
          const isAlreadyInTeam = proj.team.some((m) => m.userId === targetInv.candidateId);
          if (isAlreadyInTeam) return proj;

          const updatedTeam = [
            ...proj.team,
            {
              userId: targetInv.candidateId,
              user: targetInv.candidate,
              roleTitle: targetInv.roleTitle,
              joinedAt: 'Just now',
            },
          ];

          const updatedRoles = proj.openRoles.map((r) =>
            r.title.toLowerCase() === targetInv.roleTitle.toLowerCase() || r.id === targetInv.roleId
              ? { ...r, filled: Math.min(r.spots, r.filled + 1) }
              : r
          );

          return {
            ...proj,
            team: updatedTeam,
            openRoles: updatedRoles,
          };
        }
        return proj;
      })
    );

    // 3. Update corresponding application if exists
    setApplications((prev) =>
      prev.map((a) =>
        a.projectId === targetInv.projectId && a.applicantId === targetInv.candidateId
          ? { ...a, status: 'accepted' as const, updatedAt: 'Just now' }
          : a
      )
    );

    triggerToast(`🎉 Congratulations! You joined the squad for "${targetInv.projectTitle}"!`);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // Reject Project Invitation
  const handleRejectInvitation = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: 'rejected' as const, updatedAt: 'Just now' }
          : inv
      )
    );
    triggerToast('Invitation declined.');
  };

  // Save Project Invitation for Later
  const handleSaveInvitationForLater = (invitationId: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? { ...inv, status: 'saved_for_later' as const, updatedAt: 'Just now' }
          : inv
      )
    );
    triggerToast('Invitation saved for later. You can review or chat doubts whenever ready!');
  };

  // Send Direct Message / Doubt in Invitation Thread
  const handleSendInvitationMessage = (invitationId: string, text: string) => {
    const targetInv = invitations.find((i) => i.id === invitationId);
    if (!targetInv) return;

    const isMeOwner = targetInv.ownerId === currentUser.id;
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: 'Just now',
      isOwner: isMeOwner,
    };

    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === invitationId
          ? {
              ...inv,
              updatedAt: 'Just now',
              messages: [...(inv.messages || []), newMsg],
            }
          : inv
      )
    );

    triggerToast(`Message dispatched to ${isMeOwner ? targetInv.candidate.name : targetInv.owner.name}!`);

    // If candidate asks a doubt, simulate intelligent owner reply
    if (!isMeOwner) {
      setTimeout(() => {
        const ownerReply = {
          id: `msg-reply-${Date.now()}`,
          senderId: targetInv.ownerId,
          senderName: targetInv.owner.name,
          senderAvatar: targetInv.owner.avatar,
          text: `Thanks for reaching out, ${currentUser.name.split(' ')[0]}! We work asynchronously with flexible sprint milestones. Feel free to accept whenever you're comfortable!`,
          timestamp: 'Just now',
          isOwner: true,
        };

        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? {
                  ...inv,
                  updatedAt: 'Just now',
                  messages: [...(inv.messages || []), ownerReply],
                }
              : inv
          )
        );
        triggerToast(`💬 New reply from ${targetInv.owner.name} (Project Owner)!`);
      }, 1200);
    }
  };

  // Filter projects owned by the current active user
  const myProjects = projects.filter((p) => p.ownerId === currentUser.id);

  // Filter user applications
  const userApplications = applications.filter((a) => a.applicantId === currentUser.id);

  return (
    <div className="min-h-screen bg-[#08080A] text-[#E2E8F0] flex flex-col selection:bg-[#14b8a6] selection:text-black">
      
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 px-5 rounded-full bg-[#08080A]/95 border border-[#14b8a6]/40 shadow-2xl text-xs text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 glow-accent backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        isLoggedIn={isLoggedIn}
        currentMode={appMode}
        onModeChange={(mode) => {
          setAppMode(mode);
          setViewState('app');
        }}
        currentUser={currentUser}
        allUsers={allUsers}
        authMode={authMode}
        onSwitchUser={handleSwitchUser}
        onUpdateAvailability={handleUpdateAvailability}
        onOpenPostProject={() => setIsPostProjectOpen(true)}
        onOpenProfile={() => setSelectedCandidate(currentUser)}
        onOpenEditProfile={() => setIsOnboardingOpen(true)}
        onOpenApplications={() => setIsApplicationsOpen(true)}
        onOpenInvitations={() => setIsInvitationsOpen(true)}
        onGoHome={() => setViewState('landing')}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        pendingApplicationsCount={userApplications.filter((a) => a.status === 'pending').length}
        pendingInvitationsCount={invitations.filter((i) => i.candidateId === currentUser.id && (i.status === 'pending' || i.status === 'saved_for_later')).length}
        onExploreProjects={() => {
          if (viewState !== 'landing') {
            setViewState('landing');
            setTimeout(() => {
              document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Main Screen Views */}
      <main className="flex-1">
        {viewState === 'landing' ? (
          <LandingView
            onStartBuilding={() => {
              setAppMode('building');
              setViewState('app');
            }}
            onStartJoining={() => {
              setAppMode('joining');
              setViewState('app');
            }}
            onOpenAuth={handleOpenAuth}
            featuredProjects={projects}
            onSelectProject={(p) => setSelectedProject(p)}
            onViewCandidate={(c) => setSelectedCandidate(c)}
            candidates={allUsers}
          />
        ) : appMode === 'joining' ? (
          <ContributorDashboard
            currentUser={currentUser}
            projects={projects}
            applications={applications}
            invitations={invitations}
            onSelectProject={(p) => setSelectedProject(p)}
            onOpenApplyModal={(p) => setSelectedProject(p)}
            onOpenProfile={() => setSelectedCandidate(currentUser)}
            onOpenEditProfile={() => setIsOnboardingOpen(true)}
            onOpenInvitations={() => setIsInvitationsOpen(true)}
            onUpdateAvailability={handleUpdateAvailability}
            onSwitchToOwnerMode={() => setAppMode('building')}
            onWithdrawApplication={handleRemoveApplicant}
          />
        ) : (
          <OwnerDashboard
            currentUser={currentUser}
            myProjects={myProjects.length > 0 ? myProjects : projects.slice(0, 2)}
            allApplications={applications}
            allUsers={allUsers}
            invitations={invitations}
            onOpenPostProject={() => setIsPostProjectOpen(true)}
            onViewCandidate={(c) => setSelectedCandidate(c)}
            onAcceptApplicant={handleAcceptApplicant}
            onWaitlistApplicant={handleWaitlistApplicant}
            onDeclineApplicant={handleDeclineApplicant}
            onRemoveApplicant={handleRemoveApplicant}
            onRemoveTeamMember={handleRemoveTeamMember}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onInviteCandidate={handleInviteCandidate}
            onSendMessage={handleSendInvitationMessage}
            onSelectProjectDetail={(p) => setSelectedProject(p)}
          />
        )}
      </main>

      {/* Authentication / Entry Choices Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onRegister={handleRegisterUser}
        onLogin={handleLoginUser}
        onSelectDemo={handleSelectDemoUser}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        currentUser={currentUser}
        existingApplication={applications.find(
          (a) => a.projectId === selectedProject?.id && a.applicantId === currentUser.id
        )}
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        onSubmitApplication={handleSubmitApplication}
        onViewCandidate={(c) => setSelectedCandidate(c)}
        onSwitchToOwnerMode={() => {
          setSelectedProject(null);
          setAppMode('building');
        }}
      />

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        candidate={selectedCandidate}
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        myProjects={myProjects}
        onInviteToProject={(cId, pId, roleTitle, note) => handleInviteCandidate(cId, pId, roleTitle, note)}
      />

      {/* Post Project Modal */}
      <PostProjectModal
        isOpen={isPostProjectOpen}
        onClose={() => setIsPostProjectOpen(false)}
        currentUser={currentUser}
        onSaveProject={handleSaveProject}
      />

      {/* Onboarding & Edit Profile Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      {/* Applications Tracker Modal */}
      <ApplicationsTracker
        isOpen={isApplicationsOpen}
        onClose={() => setIsApplicationsOpen(false)}
        applications={userApplications}
        projects={projects}
        onSelectProject={(p) => {
          setSelectedProject(p);
          setIsApplicationsOpen(false);
        }}
      />

      {/* Direct Project Invitations & Doubts Clarification Modal */}
      <InvitationsModal
        isOpen={isInvitationsOpen}
        onClose={() => setIsInvitationsOpen(false)}
        invitations={invitations}
        currentUser={currentUser}
        projects={projects}
        onAcceptInvitation={handleAcceptInvitation}
        onRejectInvitation={handleRejectInvitation}
        onSaveForLater={handleSaveInvitationForLater}
        onSendMessage={handleSendInvitationMessage}
        onSelectProject={(p) => {
          setSelectedProject(p);
          setIsInvitationsOpen(false);
        }}
      />

    </div>
  );
}

