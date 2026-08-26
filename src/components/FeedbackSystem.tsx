import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  CheckCircle, 
  Award,
  Users
} from 'lucide-react';
export const FeedbackSystem: React.FC = () => {
  const { db, currentUser, triggerRefresh } = useApp();

  const [selectedTarget, setSelectedTarget] = useState<{ id: string; type: 'webinar' | 'meeting'; title: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form ratings state
  const [ratings, setRatings] = useState({
    overall: 5,
    content: 5,
    speaker: 5,
    usefulness: 5
  });
  const [commentUseful, setCommentUseful] = useState('');
  const [commentImprove, setCommentImprove] = useState('');
  const [recommend, setRecommend] = useState<boolean | null>(true);

  // Retrieve records
  const allWebinars = db.getWebinars();
  const allMeetings = db.getMeetings();
  const registrations = db.getWebinarRegistrations();
  const feedbacks = db.getFeedbacks();

  // 1. Identify completed items requiring feedback
  // Webinars that are COMPLETED and user registered for them
  const completedWebinars = allWebinars
    .filter(w => w.status === 'COMPLETED')
    .filter(w => registrations.some(r => r.webinarId === w.id && r.userId === currentUser.email));

  // Meetings that are in the past (date before today, or today but time passed)
  const todayStr = new Date().toISOString().split('T')[0];
  const completedMeetings = allMeetings
    .filter(m => m.date < todayStr || (m.date === todayStr && m.endTime < new Date().toTimeString().slice(0, 5)))
    .filter(m => m.organizerId === currentUser.email || m.participants.includes(currentUser.email));

  // Exclude items already reviewed by user
  const pendingReviews: { id: string; type: 'webinar' | 'meeting'; title: string }[] = [];

  completedWebinars.forEach(web => {
    const reviewed = feedbacks.some(f => f.targetId === web.id && f.userId === currentUser.email);
    if (!reviewed) {
      pendingReviews.push({ id: web.id, type: 'webinar', title: web.title });
    }
  });

  completedMeetings.forEach(meet => {
    const reviewed = feedbacks.some(f => f.targetId === meet.id && f.userId === currentUser.email);
    if (!reviewed) {
      pendingReviews.push({ id: meet.id, type: 'meeting', title: meet.title });
    }
  });

  const handleRatingClick = (category: keyof typeof ratings, score: number) => {
    setRatings(prev => ({ ...prev, [category]: score }));
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;

    db.submitFeedback({
      targetId: selectedTarget.id,
      targetType: selectedTarget.type,
      userId: currentUser.email,
      ratingOverall: ratings.overall,
      ratingContent: ratings.content,
      ratingSpeaker: ratings.speaker,
      ratingUsefulness: ratings.usefulness,
      commentUseful,
      commentImprove,
      recommend: recommend ?? true
    });

    // Reset Form
    setCommentUseful('');
    setCommentImprove('');
    setRecommend(true);
    setRatings({ overall: 5, content: 5, speaker: 5, usefulness: 5 });
    setSelectedTarget(null);
    setSuccessMsg(true);
    
    setTimeout(() => setSuccessMsg(false), 4000);
    triggerRefresh();
  };

  // 2. Admin feedback analytics calculation
  const totalFbCount = feedbacks.length;
  const avgOverall = totalFbCount > 0 ? (feedbacks.reduce((sum, f) => sum + f.ratingOverall, 0) / totalFbCount).toFixed(1) : '0.0';
  const avgContent = totalFbCount > 0 ? (feedbacks.reduce((sum, f) => sum + f.ratingContent, 0) / totalFbCount).toFixed(1) : '0.0';
  const avgSpeaker = totalFbCount > 0 ? (feedbacks.reduce((sum, f) => sum + f.ratingSpeaker, 0) / totalFbCount).toFixed(1) : '0.0';
  const avgUsefulness = totalFbCount > 0 ? (feedbacks.reduce((sum, f) => sum + f.ratingUsefulness, 0) / totalFbCount).toFixed(1) : '0.0';
  
  const recommendPercent = totalFbCount > 0 ? Math.round((feedbacks.filter(f => f.recommend).length / totalFbCount) * 100) : 0;

  const renderStarsSelector = (category: keyof typeof ratings) => {
    return (
      <div className="flex space-x-1.5 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(category, star)}
            className="focus:outline-none"
          >
            <Star
              size={18}
              className={star <= ratings[category] ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Subheader */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Session Feedback & Reviews
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Review previous sync lectures or read feedback summaries compiled for organizers.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center animate-fade-in">
          <CheckCircle size={16} className="mr-2" /> Thank you! Your feedback has been saved and shared with the organizers.
        </div>
      )}

      {/* ====================================================
          ADMIN VIEW: ANALYTICS DASHBOARD
          ==================================================== */}
      {currentUser.role === 'ADMIN' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
            Organizer Analytics Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Avg Card */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Average Overall Rating</span>
                <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white flex items-center">
                  {avgOverall} <Star size={20} className="text-amber-400 fill-amber-400 ml-1.5" />
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Based on {totalFbCount} responses</span>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                <Award size={24} />
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Recommendation Rate</span>
                <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  {recommendPercent}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Attendees who would recommend</span>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <ThumbsUp size={24} />
              </div>
            </div>

            {/* Total reviews */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Total Reviews</span>
                <span className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                  {totalFbCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Completed feedback submissions</span>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Users size={24} />
              </div>
            </div>

          </div>

          {/* Detailed breakdown metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Breakdowns */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800">
                Performance Breakdowns
              </h3>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Overall Session Quality</span>
                    <span>{avgOverall}/5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(Number(avgOverall)/5)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Content Validity & Quality</span>
                    <span>{avgContent}/5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(Number(avgContent)/5)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Speaker / Host Skills</span>
                    <span>{avgSpeaker}/5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${(Number(avgSpeaker)/5)*100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Usefulness & Practicality</span>
                    <span>{avgUsefulness}/5.0</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${(Number(avgUsefulness)/5)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* List of recent feedbacks */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-3">
                  Attendee Feedback Submissions
                </h3>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">No feedback submissions yet.</div>
                  ) : (
                    feedbacks.map(fb => {
                      const webTarget = allWebinars.find(w => w.id === fb.targetId);
                      const meetTarget = allMeetings.find(m => m.id === fb.targetId);
                      const title = webTarget ? webTarget.title : (meetTarget ? meetTarget.title : 'Target ID: ' + fb.targetId);

                      return (
                        <div key={fb.id} className="border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase mr-2">
                                {fb.targetType}
                              </span>
                              <strong className="text-xs text-slate-800 dark:text-slate-200">{title}</strong>
                            </div>
                            <div className="flex items-center text-xs font-bold">
                              <Star size={12} className="text-amber-400 fill-amber-400 mr-1" /> {fb.ratingOverall}
                            </div>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-2.5 rounded">
                            <div>
                              <strong className="text-[9px] uppercase block mb-0.5 text-slate-500">What was useful:</strong>
                              <p className="text-slate-600 dark:text-slate-350 italic">"{fb.commentUseful || 'No comment provided'}"</p>
                            </div>
                            <div>
                              <strong className="text-[9px] uppercase block mb-0.5 text-slate-500">Improvement area:</strong>
                              <p className="text-slate-600 dark:text-slate-350 italic">"{fb.commentImprove || 'No suggestions'}"</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          GENERAL USERS VIEW: SUBMIT NEW FEEDBACKS
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: pending items lists */}
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-3">
            Pending Feedback Reviews
          </h2>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
            Select a completed meeting or webinar you attended to submit your comments.
          </p>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
            {pendingReviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-450 italic">
                You're all caught up! 🎉
              </div>
            ) : (
              pendingReviews.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedTarget(item)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors duration-150 ${
                    selectedTarget?.id === item.id 
                      ? 'border-nexora-blue bg-nexora-blue/5 dark:bg-nexora-blue/10'
                      : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
                  }`}
                >
                  <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider block w-max mb-1.5">
                    {item.type}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</h4>
                  <span className="text-[10px] text-nexora-blue dark:text-nexora-electric font-semibold block mt-2 text-right">
                    Submit Feedback &rarr;
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right pane: feedback forms */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-800 mb-4">
            Feedback Questionnaire
          </h2>

          {!selectedTarget ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <MessageSquare className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">Select a session from the list</p>
              <p className="text-xs">Your honest feedback helps mentors refine technical contents.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              
              {/* Selected Title info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded border border-slate-150 dark:border-slate-800/80">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-bold">Reviewing Session</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedTarget.title}</span>
              </div>

              {/* Star metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block">1. Overall Session Quality</label>
                  {renderStarsSelector('overall')}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block">2. Content Validity & Depth</label>
                  {renderStarsSelector('content')}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block">3. Speaker / Organizer Skill</label>
                  {renderStarsSelector('speaker')}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block">4. Usefulness & Practical Application</label>
                  {renderStarsSelector('usefulness')}
                </div>
              </div>

              {/* Comment inputs */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">What did you find most useful?</label>
                <textarea
                  rows={2}
                  required
                  value={commentUseful}
                  onChange={(e) => setCommentUseful(e.target.value)}
                  placeholder="e.g. The live code examples and explain statements mapping in slides..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">What can we improve in future sessions?</label>
                <textarea
                  rows={2}
                  value={commentImprove}
                  onChange={(e) => setCommentImprove(e.target.value)}
                  placeholder="e.g. Provide the slides link before the meeting starts..."
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>

              {/* Recommend toggle */}
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-2">Would you recommend this session?</label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setRecommend(true)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center border transition-colors ${
                      recommend === true
                        ? 'bg-green-500/10 border-green-500 text-green-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp size={14} className="mr-1.5" /> Yes, absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommend(false)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center border transition-colors ${
                      recommend === false
                        ? 'bg-red-500/10 border-red-500 text-red-650'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsDown size={14} className="mr-1.5" /> No, not really
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all duration-150"
                >
                  Submit Review
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

    </div>
  );
};
