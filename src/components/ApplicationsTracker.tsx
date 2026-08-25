import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Sparkles, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Application, Project } from '../types';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';

interface ApplicationsTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  applications?: Application[];
  projects?: Project[];
  onSelectProject: (project: Project) => void;
}

export const ApplicationsTracker: React.FC<ApplicationsTrackerProps> = ({
  isOpen,
  onClose,
  applications = [],
  projects = [],
  onSelectProject,
}) => {
  if (!isOpen) return null;

  const safeApplications = applications || [];
  const safeProjects = projects || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#08080A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                My Project Applications
              </h2>
              <p className="text-xs text-white/40">
                Track status across your companion team submissions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Applications */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {safeApplications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <FileText className="w-8 h-8 text-white/30 mx-auto" />
              <h3 className="font-display text-base font-bold text-white">
                No applications submitted yet
              </h3>
              <p className="text-xs text-white/40 max-w-xs mx-auto">
                Explore open project openings in the feed and submit your first companion match!
              </p>
            </div>
          ) : (
            safeApplications.map((app) => {
              const project = safeProjects.find((p) => p.id === app.projectId);
              return (
                <div
                  key={app.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    app.status === 'accepted'
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : app.status === 'viewed'
                      ? 'bg-sky-950/20 border-sky-700/50'
                      : app.status === 'declined'
                      ? 'bg-rose-950/10 border-rose-900/40 opacity-70'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-semibold text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-0.5 rounded-full border border-[#14b8a6]/20">
                          {app.projectDomain}
                        </span>
                        <span className="text-white/40">Applied {app.appliedAt}</span>
                      </div>

                      <h3 className="font-display text-base font-bold text-white">
                        {app.projectTitle}
                      </h3>

                      <div className="text-xs text-white/60">
                        Target Role: <strong className="text-white font-semibold">{app.roleTitle}</strong>
                      </div>

                      {app.note && (
                        <p className="text-xs text-white/60 italic bg-black/40 p-3 rounded-xl border border-white/5 mt-2">
                          "{app.note}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center gap-2 self-center sm:self-start">
                      <MatchGauge score={app.matchScore} size="sm" showInfoButton />
                      
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'accepted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : app.status === 'viewed'
                            ? 'bg-sky-950 text-sky-300 border border-sky-600'
                            : app.status === 'declined'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-600'
                        }`}
                      >
                        ● {app.status}
                      </span>
                    </div>
                  </div>

                  {project && (
                    <div className="mt-3.5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-white/40">
                        <div className="relative">
                          <img
                            src={project.owner.avatar}
                            alt={project.owner.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <StatusDot
                            status={project.owner.availability}
                            size="sm"
                            className="absolute -bottom-0.5 -right-0.5"
                          />
                        </div>
                        <span>Created by {project.owner.name}</span>
                      </div>

                      <button
                        onClick={() => {
                          onSelectProject(project);
                          onClose();
                        }}
                        className="text-[#14b8a6] hover:text-[#14b8a6]/80 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Project Page</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#08080A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
