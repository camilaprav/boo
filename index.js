let resolve = x => (typeof x === 'function' ? x() : x);

class Boo {
  constructor(ov, target, opt = {}) {
    Object.assign(this, {
      ov,
      target,
      ...opt,
      container: opt.container || document.body,
      origin: opt.origin || document,
      hiddenClass: opt.hiddenClass || 'hidden',
    });
    this.enable();
    this.frame();
  }

  frame = () => {
    if (!this.enabled) return;
    let target = resolve(this.target);
    let container = resolve(this.container);
    let origin = resolve(this.origin);
    let ov = resolve(this.ov);
    let originRect = origin?.getBoundingClientRect?.();
    let targetRect = target?.getBoundingClientRect?.();
    if (targetRect) {
      let radius = getComputedStyle(target).borderRadius;
      if (radius !== this.oldRadius) {
        ov.style.borderRadius = radius;
        this.oldRadius = radius;
      }
    }
    if (JSON.stringify(this.oldTargetRect) === JSON.stringify(targetRect)) {
      return requestAnimationFrame(this.frame);
    }
    this.oldTargetRect = targetRect;
    if (this.smallClass) {
      ov.classList.toggle(
        this.smallClass,
        !targetRect ||
          parseInt(targetRect.width, 10) < 48 ||
          parseInt(targetRect.height, 10) < 48,
      );
    }
    if (this.transitionClass && this.lastTarget !== target) {
      ov.classList.add(this.transitionClass);
      ov.addEventListener(
        'transitionend',
        () => ov.classList.remove(this.transitionClass),
        { once: true },
      );
      this.lastTarget = target;
    }
    ov.classList[targetRect && container ? 'remove' : 'add'](this.hiddenClass);
    if (!ov.classList.contains(this.hiddenClass) && targetRect) {
      ov.style.position = 'absolute';
      ov.style.boxSizing = 'border-box';
      if (container.style.position === 'static') {
        container.style.position = 'relative';
      }
      let or = originRect || { left: 0, top: 0 };
      ov.style.left = `${or.left + targetRect.left}px`;
      ov.style.top = `${or.top + targetRect.top}px`;
      ov.style.width = `${targetRect.width}px`;
      ov.style.height = `${targetRect.height}px`;
      let clipRect =
        target?.ownerDocument?.defaultView?.frameElement?.getBoundingClientRect();
      let ovRect = ov.getBoundingClientRect();
      let localClipRect = clipRect && {
        left: clipRect.left - ovRect.left,
        top: clipRect.top - ovRect.top,
      };
      Object.assign(localClipRect, {
        right: localClipRect.left + clipRect.width,
        bottom: localClipRect.top + clipRect.height,
      });
      if (clipRect) {
        ov.style.clipPath = `polygon(
          ${localClipRect.left}px ${localClipRect.top}px,
          ${localClipRect.right}px ${localClipRect.top}px,
          ${localClipRect.right}px ${localClipRect.bottom}px,
          ${localClipRect.left}px ${localClipRect.bottom}px
        )`;
      } else {
        ov.style.clipPath = '';
      }
    }
    requestAnimationFrame(this.frame);
  };

  enable(x = true) {
    if (x) {
      this.container.append(this.ov);
    } else {
      this.ov.remove();
    }
    this.enabled = x;
  }

  disable() {
    this.enable(false);
  }
}

export default Boo;
