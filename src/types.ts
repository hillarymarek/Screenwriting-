/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenplayElementType =
  | 'Scene Heading'
  | 'Action'
  | 'Character'
  | 'Dialogue'
  | 'Parenthetical'
  | 'Transition'
  | 'Shot';

export interface ScreenplayElement {
  id: string;
  type: ScreenplayElementType;
  text: string;
}

export interface Screenplay {
  title: string;
  author: string;
  elements: ScreenplayElement[];
}

export interface HistoryItem {
  timestamp: string;
  title: string;
  script: Screenplay;
}
