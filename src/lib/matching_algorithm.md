# Nomance Matching Algorithm v1

Nomance prioritizes **Intent Clarity** and **Values Alignment** over shallow engagement metrics.

## Inputs
1. **Intent Match (Weight: 50%)**: Does the other person want the same thing?
2. **Values Alignment (Weight: 30%)**: How many core values do you share?
3. **Quality Score (Weight: 20%)**: A hidden reputation score based on responsiveness and respectful behavior.

## Logic
- **Intent Multiplier**: 
  - Exact Intent Match: 1.0x
  - Compatible Intent (e.g., Long-term vs Life Partner): 0.8x
  - Incompatible Intent: 0.2x (filtered out of discovery)
- **Value Boost**: Each shared value adds a 0.1x boost to the match score.
- **Quality Multiplier**: (Quality Score / 100). Users with high quality scores (120+) get prioritized in discovery.

## Reputation Scoring
- **+5 pts**: Replying to a message within 6 hours.
- **+10 pts**: Receiving a 'High-Quality Conversation' signal.
- **-20 pts**: Being reported for shallow or disrespectful behavior.
- **-10 pts**: Ghosting a mutual match (no reply for 7 days).
