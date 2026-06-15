export type SlotContent = Record<string, string | string[]>;

export interface GeneratedSlide {
  layoutId: string;
  brief: string;
  title?: string;
  slots: SlotContent;
}

export interface FullDeckGeneration {
  title: string;
  slides: GeneratedSlide[];
}

export interface AIProvider {
  generateFullDeck(
    topic: string,
    slideCount: number,
    tone: string,
    availableLayouts?: any[]
  ): Promise<FullDeckGeneration>;
}