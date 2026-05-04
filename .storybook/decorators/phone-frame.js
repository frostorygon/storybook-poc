/**
 * Phone Frame Decorator
 *
 * Wraps story content in a simulated mobile device frame.
 * Purely a Storybook presentation concern — not part of any component.
 *
 * Usage:
 *   import { withPhoneFrame } from '../../.storybook/decorators/phone-frame.js';
 *   export default { decorators: [withPhoneFrame] };
 *
 * Or apply globally in preview.js:
 *   import { withPhoneFrame } from './decorators/phone-frame.js';
 *   export const decorators = [withPhoneFrame];
 */

const PHONE_STYLES = `
  .phone-frame {
    width: 414px;
    min-height: 667px;
    margin: 0 auto;
    border-radius: 40px;
    border: 3px solid #3a3a3c;
    background: #ffffff;
    box-shadow:
      0 0 0 2px #1a1a1c,
      0 20px 60px rgba(0, 0, 0, 0.4),
      inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  }

  /* ── Status Bar (carrier, time, battery) ──────────────────────── */
  .phone-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #1c1c1e;
    background: #f2f2f7;
    user-select: none;
  }

  .phone-status-bar__time {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .phone-status-bar__icons {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  /* ── Notch ────────────────────────────────────────────────────── */
  .phone-notch {
    width: 126px;
    height: 28px;
    background: #1a1a1c;
    border-radius: 0 0 18px 18px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }

  .phone-notch__camera {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2c2c2e;
    position: absolute;
    right: 22px;
    top: 8px;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
  }

  /* ── Nav Bar (app header) ────────────────────────────────────── */
  .phone-nav-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #e65100, #ff6d00);
    position: relative;
  }

  .phone-nav-bar__back {
    position: absolute;
    left: 16px;
    font-size: 20px;
    opacity: 0.9;
  }

  /* ── Content Area ────────────────────────────────────────────── */
  .phone-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: #ffffff;
  }

  .phone-content > * {
    max-width: 100%;
    box-sizing: border-box;
  }

  /* ── Bottom Bar (home indicator) ─────────────────────────────── */
  .phone-bottom-bar {
    display: flex;
    justify-content: center;
    padding: 8px 0 6px;
    background: #f2f2f7;
  }

  .phone-home-indicator {
    width: 134px;
    height: 5px;
    border-radius: 3px;
    background: #c7c7cc;
  }
`;

/**
 * Creates a phone frame wrapper around the story content.
 *
 * @param {Function} StoryFn - Storybook story function
 * @returns {HTMLElement} Phone frame wrapping the story
 */
export function withPhoneFrame(StoryFn) {
  const wrapper = document.createElement('div');

  // Inject styles once
  if (!document.querySelector('#phone-frame-styles')) {
    const style = document.createElement('style');
    style.id = 'phone-frame-styles';
    style.textContent = PHONE_STYLES;
    document.head.appendChild(style);
  }

  wrapper.innerHTML = `
    <div class="phone-frame">
      <div class="phone-notch">
        <div class="phone-notch__camera"></div>
      </div>
      <div class="phone-status-bar">
        <span>Carrier</span>
        <span class="phone-status-bar__time">9:41</span>
        <span class="phone-status-bar__icons">
          <span>📶</span>
          <span>🔋</span>
        </span>
      </div>
      <div class="phone-nav-bar">
        <span class="phone-nav-bar__back">‹</span>
        Card Management
      </div>
      <div class="phone-content"></div>
      <div class="phone-bottom-bar">
        <div class="phone-home-indicator"></div>
      </div>
    </div>
  `;

  const content = wrapper.querySelector('.phone-content');
  const storyResult = StoryFn();

  if (storyResult instanceof Node) {
    content.appendChild(storyResult);
  } else {
    content.innerHTML = storyResult;
  }

  return wrapper;
}
