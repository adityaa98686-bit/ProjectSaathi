import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HelpCircle,
  Check,
  RotateCcw,
  Users
} from 'lucide-react';
import { ProjectInvitation, Project, UserProfile, InvitationStatus } from '../types';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';

interface InvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitations?: ProjectInvitation[];
  currentUser: UserProfile;
  projects?: Project[];
  onAcceptInvitation?: (invitationId: string) => void;
  onRejectInvitation?: (invitationId: string) => void;
  onSaveForLater?: (invitationId: string) => void;
  onSendMessage?: (invitationId: string, text: string) => void;
  onSelectProject?: (project: Project) => void;
  // Aliases for compatibility
  onAccept?: (invitationId: string) => void;
  onReject?: (invitationId: string) => void;
}

export const InvitationsModal: React.FC<InvitationsModalProps> = ({
  isOpen,
  onClose,
  invitations = [],
  currentUser,
  projects = [],
  onAcceptInvitation,
  onRejectInvitation,
  onSaveForLater,
  onSendMessage,
  onSelectProject,
  onAccept,
  onReject,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'saved_for_later' | 'accepted' | 'rejected'>('pending');
  const [activeChatInviteId, setActiveChatInviteId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const handleAccept = onAcceptInvitation || onAccept || (() => {});
  const handleReject = onRejectInvitation || onReject || (() => {});

  // Auto-scroll chat to bottom
  const safeInvitations = invitations || [];
  const activeChatInvite = safeInvitations.find((inv) => inv.id === activeChatInviteId);

  useEffect(() => {
    if (activeChatInviteId && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatInviteId, activeChatInvite?.messages?.length]);

  if (!isOpen) return null;

  const filteredInvitations = safeInvitations.filter((inv) => {
    if (activeFilter === 'all') return true;
    return inv.status === activeFilter;
  });

  const pendingCount = safeInvitations.filter((i) => i.status === 'pending').length;
  const savedCount = safeInvitations.filter((i) => i.status === 'saved_for_later').length;

  const handleSendChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatInviteId || !onSendMessage) return;

    onSendMessage(activeChatInviteId, messageInput.trim());
    setMessageInput('');
  };

  const handleQuickQuestionClick = (question: string) => {
    if (!activeChatInviteId || !onSendMessage) return;
    onSendMessage(activeChatInviteId, question);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0C0C12] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#14b8a6]/20 border border-[#14b8a6]/30 flex items-center justify-center text-[#14b8a6] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                  Squad Invitations & Inquiries Hub
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#14b8a6] text-black font-extrabold text-[11px]">
                    {pendingCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Review invites from project owners, ask doubts, save opportunities for later, or join squads.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filter Bar */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-white/5 bg-[#08080A] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setActiveFilter('pending');
                setActiveChatInviteId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Pending Invites</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveFilter('saved_for_later');
                setActiveChatInviteId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'saved_for_later'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Saved for Later</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveFilter('accepted');
                setActiveChatInviteId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'accepted'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Accepted</span>
            </button>

            <button
              onClick={() => {
                setActiveFilter('all');
                setActiveChatInviteId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                  : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
              }`}
            >
              <span>All ({invitations.length})</span>
            </button>
          </div>
        </div>

        {/* Content Container (Split when Chat is active on large screens or full list) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {filteredInvitations.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-3 max-w-md mx-auto">
              <Mail className="w-8 h-8 text-white/30 mx-auto" />
              <h3 className="font-display text-base font-bold text-white">
                No {activeFilter.replace(/_/g, ' ')} invitations
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                {activeFilter === 'pending'
                  ? "You don't have any pending squad invitations right now. Explore projects in the feed or keep your profile availability updated to get invited!"
                  : activeFilter === 'saved_for_later'
                  ? "You haven't bookmarked any invitations. Click 'Save for Later' on any invite to decide at your own pace."
                  : 'No invitations in this category.'}
              </p>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/15 cursor-pointer"
                >
                  View All Invitations
                </button>
              )}
            </div>
          ) : (
            filteredInvitations.map((invitation) => {
              const project = (projects || []).find((p) => p.id === invitation.projectId);
              const isChatOpen = activeChatInviteId === invitation.id;
              const hasMessages = invitation.messages && invitation.messages.length > 0;

              return (
                <div
                  key={invitation.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    invitation.status === 'accepted'
                      ? 'bg-[#14b8a6]/5 border-[#14b8a6]/40'
                      : invitation.status === 'saved_for_later'
                      ? 'bg-amber-500/[0.03] border-amber-500/30'
                      : invitation.status === 'rejected'
                      ? 'bg-rose-950/10 border-rose-900/30 opacity-60'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Card Main Info */}
                  <div className="p-5 space-y-4">
                    
                    {/* Header Row: Domain, Owner, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-0.5 rounded-full border border-[#14b8a6]/20 text-xs">
                          {invitation.projectDomain}
                        </span>
                        
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <span>Invited by</span>
                          <div className="flex items-center gap-1 font-semibold text-white">
                            <div className="relative">
                              <img
                                src={invitation.owner.avatar}
                                alt={invitation.owner.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <StatusDot
                                status={invitation.owner.availability}
                                size="sm"
                                className="absolute -bottom-0.5 -right-0.5"
                              />
                            </div>
                            <span>{invitation.owner.name}</span>
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 rounded border border-amber-500/20">Owner</span>
                          </div>
                        </div>

                        <span className="text-white/30 text-xs">• {invitation.createdAt}</span>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        {invitation.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> Action Required
                          </span>
                        )}
                        {invitation.status === 'saved_for_later' && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
                            <BookmarkCheck className="w-3 h-3 text-amber-400" /> Saved for Later
                          </span>
                        )}
                        {invitation.status === 'accepted' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Joined Squad
                          </span>
                        )}
                        {invitation.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-400" /> Declined
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Project Title, Target Role & Compatibility Score */}
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => project && onSelectProject(project)}
                            className="font-display text-lg font-extrabold text-white hover:text-[#14b8a6] cursor-pointer transition-colors"
                          >
                            {invitation.projectTitle}
                          </h3>
                          {project && (
                            <ExternalLink 
                              onClick={() => onSelectProject(project)}
                              className="w-3.5 h-3.5 text-white/40 hover:text-white cursor-pointer" 
                            />
                          )}
                        </div>

                        <div className="text-xs text-white/70">
                          Target Squad Role: <strong className="text-[#14b8a6] font-bold">{invitation.roleTitle}</strong>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block">Compatibility</span>
                          <span className="text-xs text-white/80 font-bold">{invitation.matchScore}% Match</span>
                        </div>
                        <MatchGauge score={invitation.matchScore} size="sm" />
                      </div>
                    </div>

                    {/* Owner's Pitch / Invitation Note */}
                    {invitation.initialNote && (
                      <div className="p-3.5 rounded-xl bg-[#08080A] border border-white/5 text-xs text-white/80 leading-relaxed">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                          <Crown className="w-3 h-3 text-amber-400" /> Owner's Personal Note:
                        </div>
                        "{invitation.initialNote}"
                      </div>
                    )}

                    {/* Match Breakdown Highlight */}
                    {invitation.matchBreakdown?.explanation && (
                      <div className="text-xs text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#14b8a6] shrink-0" />
                        <span>{invitation.matchBreakdown.explanation}</span>
                      </div>
                    )}

                    {/* Action Bar: Accept / Save / Reject / Chat */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2.5">
                      
                      {/* Left: Chat / Ask Doubts Toggle */}
                      <button
                        onClick={() => setActiveChatInviteId(isChatOpen ? null : invitation.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isChatOpen
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>
                          {isChatOpen ? 'Hide Discussion' : 'Ask Doubts / Chat with Owner'}
                        </span>
                        {invitation.messages && invitation.messages.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-200 text-[10px] font-bold">
                            {invitation.messages.length}
                          </span>
                        )}
                      </button>

                      {/* Right: Decision Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {invitation.status === 'accepted' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> You are in this Squad
                            </span>
                            {project && onSelectProject && (
                              <button
                                onClick={() => {
                                  onSelectProject(project);
                                  onClose();
                                }}
                                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <span>Go to Project</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : invitation.status === 'rejected' ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
                              Declined
                            </span>
                            {onSaveForLater && (
                              <button
                                onClick={() => onSaveForLater(invitation.id)}
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                              >
                                Move to Saved
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Save For Later Toggle */}
                            {onSaveForLater && (
                              <button
                                onClick={() => onSaveForLater(invitation.id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  invitation.status === 'saved_for_later'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-white/5 hover:bg-amber-500/10 text-white/70 hover:text-amber-300 border border-white/10 hover:border-amber-500/30'
                                }`}
                                title={invitation.status === 'saved_for_later' ? 'Unsave' : 'Save for later to decide later'}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>{invitation.status === 'saved_for_later' ? 'Saved' : 'Save for Later'}</span>
                              </button>
                            )}

                            {/* Reject / Decline Button */}
                            <button
                              onClick={() => handleReject(invitation.id)}
                              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/60 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                            >
                              Decline
                            </button>

                            {/* Accept Invitation Button */}
                            <button
                              onClick={() => handleAccept(invitation.id)}
                              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Accept Squad Invite</span>
                            </button>
                          </>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Expandable Discussion / Doubts Chat Pane */}
                  {isChatOpen && (
                    <div className="border-t border-white/10 bg-[#050507] p-5 space-y-4 animate-in fade-in duration-200">
                      
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-bold text-white">
                            Direct Q&A with {invitation.owner.name} ({invitation.projectTitle})
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40">
                          Clarify scope, schedules, tech stacks, or deliverables
                        </span>
                      </div>

                      {/* Quick Question Inspiration Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <span className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1 mr-1">
                          <HelpCircle className="w-3 h-3" /> Quick Questions:
                        </span>
                        {[
                          'What is the weekly sprint schedule?',
                          'What tech stack details should I know?',
                          'Can I contribute asynchronously?',
                          'What is our hackathon milestone?',
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => handleQuickQuestionClick(q)}
                            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-sky-500/20 text-white/70 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 text-[11px] transition-colors cursor-pointer"
                          >
                            + {q}
                          </button>
                        ))}
                      </div>

                      {/* Messages Stream */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {invitation.messages && invitation.messages.length > 0 ? (
                          invitation.messages.map((msg) => {
                            const isMe = msg.senderId === currentUser.id;

                            return (
                              <div
                                key={msg.id}
                                className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isMe && (
                                  <img
                                    src={msg.senderAvatar || invitation.owner.avatar}
                                    alt={msg.senderName}
                                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                                  />
                                )}

                                <div
                                  className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                                    isMe
                                      ? 'bg-[#14b8a6] text-black font-medium rounded-tr-sm'
                                      : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-sm'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                                    <span className="font-bold">
                                      {isMe ? 'You' : `${msg.senderName} (Owner)`}
                                    </span>
                                    <span>{msg.timestamp}</span>
                                  </div>
                                  <p>{msg.text}</p>
                                </div>

                                {isMe && (
                                  <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                                  />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-white/40">
                            No messages yet. Send a question below to connect directly with {invitation.owner.name}.
                          </div>
                        )}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {/* Composer */}
                      <form onSubmit={handleSendChatSubmit} className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder={`Ask ${invitation.owner.name} any doubts about the role, stack, or commitment...`}
                          className="flex-1 py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-500 transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={!messageInput.trim()}
                          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </form>

                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0C0C12] flex items-center justify-between">
          <span className="text-xs text-white/40">
            Accepting an invite automatically adds you to the project squad and covers your designated role.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
