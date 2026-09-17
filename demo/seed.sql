-- Fictional growth war room for the Clawnify demo workspace. No real company, brand or person.
-- Dates are relative to now so the weekly number and launch plan stay current.
INSERT INTO settings (id, product, icp, competitors, goal_customers, updated_at) VALUES
(1, 'Tallybook: bookkeeping for independent coffee shops',
 'Owner-operators of one to three coffee shops who still reconcile sales in spreadsheets and dread month-end.',
 'Ledgerly (ledgerly.example.test)
Countwise (countwise.example.test)', 100, datetime('now', '-20 days'));

INSERT INTO launches (id, platform, url, scheduled_for, status, result, notes, created_at, updated_at) VALUES
(1, 'Launchpad Weekly', 'https://launchpad.example.test/tallybook', date('now', '-18 days'), 'done', '#4 of the day, 180 upvotes', 'Founder answered every comment on launch day.', datetime('now', '-25 days'), datetime('now', '-17 days')),
(2, 'Makers Forum', 'https://makers.example.test/p/tallybook', date('now', '-4 days'), 'live', 'Front page for six hours', '', datetime('now', '-10 days'), datetime('now', '-4 days')),
(3, 'Startup Index', '', date('now', '+6 days'), 'scheduled', '', 'Screenshots and a 30-second demo video ready.', datetime('now', '-6 days'), datetime('now', '-2 days')),
(4, 'Cafe Owners Directory', '', '', 'planned', '', 'Niche directory; ask for a featured slot.', datetime('now', '-3 days'), datetime('now', '-3 days'));

INSERT INTO backlinks (id, competitor, source_site, source_url, our_url, status, notes, created_at, updated_at) VALUES
(1, 'Ledgerly', 'smallbiz-tools.example.test', 'https://smallbiz-tools.example.test/best-bookkeeping-apps', '', 'found', 'Roundup of bookkeeping apps; we are missing.', datetime('now', '-9 days'), datetime('now', '-9 days')),
(2, 'Countwise', 'cafe-ops.example.test', 'https://cafe-ops.example.test/month-end-guide', 'https://tallybook.example.test/guides/month-end', 'drafting', 'Our guide covers tips and card fees; theirs does not.', datetime('now', '-8 days'), datetime('now', '-5 days')),
(3, 'Ledgerly', 'indie-retail.example.test', 'https://indie-retail.example.test/software-stack', 'https://tallybook.example.test/stack', 'outreach_sent', 'Emailed the editor with the updated comparison.', datetime('now', '-12 days'), datetime('now', '-6 days')),
(4, 'Countwise', 'founder-notes.example.test', 'https://founder-notes.example.test/tools', 'https://tallybook.example.test', 'listed', 'Link added under Finance.', datetime('now', '-20 days'), datetime('now', '-11 days'));

INSERT INTO prospects (id, name, company, title, profile_url, channel, source, icp_fit, status, notes, created_at, updated_at) VALUES
(1, 'Mara Linden', 'Linden Roasters', 'Owner', 'https://social.example.test/mara', 'linkedin', 'commented on a Ledgerly post about month-end', 88, 'qualified', 'Two shops, runs payroll herself.', datetime('now', '-7 days'), datetime('now', '-6 days')),
(2, 'Theo Park', 'Parkside Espresso', 'Co-founder', 'https://social.example.test/theo', 'x', 'asked for spreadsheet alternatives', 81, 'qualified', '', datetime('now', '-6 days'), datetime('now', '-5 days')),
(3, 'Nadia Brook', 'Brook & Bean', 'Owner', 'https://social.example.test/nadia', 'email', 'downloaded the month-end checklist', 74, 'replied', 'Wants to see card fee reconciliation.', datetime('now', '-9 days'), datetime('now', '-2 days')),
(4, 'Owen Hale', 'Hale Coffee Co.', 'Operations lead', 'https://social.example.test/owen', 'linkedin', 'liked a Countwise launch post', 62, 'messaged', '', datetime('now', '-8 days'), datetime('now', '-3 days')),
(5, 'Ivy Moreau', 'Corner Cup', 'Owner', 'https://social.example.test/ivy', 'email', 'referral from Linden Roasters', 90, 'booked', 'Call booked for Thursday.', datetime('now', '-10 days'), datetime('now', '-1 days')),
(6, 'Sam Okafor', 'Okafor Coffee Bar', 'Owner', 'https://social.example.test/sam', 'x', 'replied to our launch thread', 85, 'customer', 'Signed up after the demo.', datetime('now', '-15 days'), datetime('now', '-4 days')),
(7, 'Lena Varga', 'Varga Bakery', 'Manager', 'https://social.example.test/lena', 'linkedin', 'engaged with a Ledgerly webinar', 35, 'found', 'Bakery, not a coffee shop; check fit.', datetime('now', '-2 days'), datetime('now', '-2 days'));

INSERT INTO creators (id, name, platform, profile_url, rate, deliverable_url, status, notes, created_at, updated_at) VALUES
(1, 'Barista Diaries', 'tiktok', 'https://video.example.test/@baristadiaries', 150, '', 'contacted', 'Sent the brief; waiting on a quote.', datetime('now', '-5 days'), datetime('now', '-3 days')),
(2, 'Small Shop Stories', 'instagram', 'https://photos.example.test/smallshopstories', 220, 'https://photos.example.test/p/month-end', 'delivered', 'Reel on month-end stress.', datetime('now', '-14 days'), datetime('now', '-2 days')),
(3, 'Espresso Economics', 'youtube', 'https://tube.example.test/@espressoeconomics', 400, '', 'sourced', '', datetime('now', '-1 days'), datetime('now', '-1 days'));

INSERT INTO content_posts (id, hook, platform, format, status, url, views, notes, created_at, updated_at) VALUES
(1, 'Closing the month in 20 minutes, filmed in real time', 'linkedin', 'video', 'posted', 'https://social.example.test/posts/1', 4200, '', datetime('now', '-12 days'), datetime('now', '-10 days')),
(2, 'The card fee line most coffee shops miss', 'x', 'video', 'scheduled', '', 0, 'Goes out Tuesday morning.', datetime('now', '-4 days'), datetime('now', '-1 days')),
(3, 'What your POS export is not telling you', 'linkedin', 'image', 'idea', '', 0, '', datetime('now', '-2 days'), datetime('now', '-2 days')),
(4, 'A day of receipts, sorted automatically', 'tiktok', 'video', 'scripting', '', 0, '', datetime('now', '-3 days'), datetime('now', '-1 days'));

INSERT INTO communities (id, name, type, url, audience, status, notes, created_at, updated_at) VALUES
(1, 'Indie Cafe Owners', 'slack', 'https://chat.example.test/indie-cafes', '3k independent cafe owners', 'joined', 'Answering questions in #finance.', datetime('now', '-16 days'), datetime('now', '-9 days')),
(2, 'The Daily Grind Letter', 'newsletter', 'https://letters.example.test/daily-grind', '18k subscribers in specialty coffee', 'pitched', 'Pitched a guest piece on margins.', datetime('now', '-11 days'), datetime('now', '-5 days')),
(3, 'Counter Talk', 'podcast', 'https://audio.example.test/counter-talk', 'Hospitality owners', 'found', '', datetime('now', '-3 days'), datetime('now', '-3 days'));

INSERT INTO trends (id, topic, source, trend_url, angle, status, post_url, notes, created_at, updated_at) VALUES
(1, 'Coffee bean prices up again', 'x', 'https://social.example.test/trends/bean-prices', 'Show how to see the margin hit per drink in one screen.', 'spotted', '', '', datetime('now', '-1 days'), datetime('now', '-1 days')),
(2, 'Small businesses sharing their month-end checklists', 'linkedin', 'https://social.example.test/trends/month-end', 'Share our checklist with the automated steps marked.', 'posted', 'https://social.example.test/posts/2', '', datetime('now', '-8 days'), datetime('now', '-7 days'));

INSERT INTO weekly_metrics (week_start, new_customers, leads_added, outreach_sent, posts_published, notes, created_at, updated_at) VALUES
(date('now', '-6 days', 'weekday 1', '-21 days'), 3, 18, 25, 2, 'First launch week.', datetime('now', '-21 days'), datetime('now', '-21 days')),
(date('now', '-6 days', 'weekday 1', '-14 days'), 5, 22, 30, 3, '', datetime('now', '-14 days'), datetime('now', '-14 days')),
(date('now', '-6 days', 'weekday 1', '-7 days'), 7, 26, 34, 3, 'Newsletter mention drove signups.', datetime('now', '-7 days'), datetime('now', '-7 days')),
(date('now', '-6 days', 'weekday 1'), 4, 12, 15, 1, 'Week in progress.', datetime('now', '-1 days'), datetime('now', '-1 days'));
