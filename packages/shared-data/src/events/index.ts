export enum PlatformEvent {
  FILTER_CHANGED = 'platform:filter:changed',
  SELECTION_CHANGED = 'platform:selection:changed',
  NAVIGATION = 'platform:navigation',
  ACTION_EXECUTED = 'platform:action:executed',
  TAB_ACTIVATED = 'platform:tab:activated',
  TAB_DEACTIVATED = 'platform:tab:deactivated',
}

export interface EventPayload<T = any> {
  source: string;
  timestamp: number;
  data: T;
}

type EventHandler<T = any> = (payload: EventPayload<T>) => void;

class PlatformEventBus {
  private handlers: Map<PlatformEvent, Set<EventHandler>> = new Map();

  on<T = any>(event: PlatformEvent, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off<T = any>(event: PlatformEvent, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<T = any>(event: PlatformEvent, data: T, source = 'unknown'): void {
    const payload: EventPayload<T> = {
      source,
      timestamp: Date.now(),
      data,
    };

    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    console.log(`[EventBus] ${event}`, payload);
  }

  clear(event?: PlatformEvent): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

export const eventBus = new PlatformEventBus();
export default eventBus;
