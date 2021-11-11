import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Bar } from '../models/bar';
import { Ship } from '../models/ship';

@Injectable()
export class FieldInstallerService {

  private renderer: Renderer2;
  private bars: Array<Bar> = new Array(100).fill(0).map(el => {
    return {
      isBusy: false
    }
  });
  public fieldElement: HTMLElement;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  public removeFlippedBars(shipId: number) {
    this.bars.forEach((bar, index) => {
      if (bar.shipType === shipId) {
        bar.isBusy = false;
        bar.shipType = null;

        const barEl = this.fieldElement.children[index];
        Array.from(barEl.children).forEach(child => {
          if (child.tagName === 'DIV') {
            barEl.removeChild(child);
          }
        })
      }
    });
  }
  public fillBars(bar: HTMLElement, itemData: Ship, position: number) {
    const indeces: number[] = [];
    const result: any = {
      shipType: itemData.id
    };
    let itemPosition = position;
    indeces.push(itemPosition - 1);

    if (itemData.barsCount === 2) {
      if (itemData.orientation === 'vertical') {
        const oneUp = this.fieldElement.children[itemPosition - 11];
        indeces.push(itemPosition - 11);
        this.addContent(oneUp);
      } else {
        const oneLeft = this.fieldElement.children[itemPosition - 2];
        indeces.push(itemPosition - 2);
        this.addContent(oneLeft);
      }
    } else if (itemData.barsCount === 3) {
      if (itemData.orientation === 'vertical') {
        const oneUp = this.fieldElement.children[itemPosition - 11];
        indeces.push(itemPosition - 11);

        const oneDown = this.fieldElement.children[itemPosition + 9];
        indeces.push(itemPosition + 9);

        this.addContent(oneUp, oneDown);
      } else {
        const oneLeft = this.fieldElement.children[itemPosition - 2];
        const oneRight = this.fieldElement.children[itemPosition];
        indeces.push(itemPosition - 2, itemPosition);
        this.addContent(oneLeft, oneRight);
      }
    } else if (itemData.barsCount === 4) {
      if (itemData.orientation === 'vertical') {
        const oneUp = this.fieldElement.children[itemPosition - 11];
        indeces.push(itemPosition - 11);

        const twoUp = this.fieldElement.children[itemPosition - 21];
        indeces.push(itemPosition - 21);

        const oneDown = this.fieldElement.children[itemPosition + 9];
        indeces.push(itemPosition + 9);

        this.addContent(oneUp, twoUp, oneDown);
      } else {
        const oneLeft = this.fieldElement.children[itemPosition - 2];
        const oneRight = this.fieldElement.children[itemPosition];
        const twoRight = this.fieldElement.children[itemPosition + 1];

        indeces.push(itemPosition - 2, itemPosition, itemPosition + 1);
        this.addContent(oneLeft, oneRight, twoRight);
      }
    }
    result.indeces = indeces;
    this.setIndeces(result);
  }
  private addContent(...items: Element[]) {
    for (const item of items) {
      item.appendChild(this.renderer.createElement('div'));
    }
  }
  public removeFilled() {
    this.getShipBarGroups().forEach(barGroup => {
      barGroup.forEach((barIndex, i, groupArray) => {

        const barEl: Element = this.fieldElement.children[barIndex];

        if (!barEl.children.length) {
          groupArray.forEach(barIndex => {
            const barEl: Element = this.fieldElement.children[barIndex];
            Array.from(barEl.children).forEach(child => {
              barEl.removeChild(child);
            });
            this.bars[barIndex].isBusy = false;
            this.bars[barIndex].shipType = null;
          })
        }
      })
    });
  }
  private setIndeces(config: { indeces: [], shipType: number }) {
    config.indeces.forEach((index: number) => {
      this.bars[index].isBusy = true;
      this.bars[index].shipType = config.shipType;
    });
  }
  private getShipBarGroups() {
    const usedIndeces = [];
    const shipBarGroups: Array<Array<number>> = [];

    this.bars.forEach((bar, index, arr) => {
      if (!bar.shipType || usedIndeces.find(val => val === bar.shipType)) return;
      const shipType = bar.shipType;
      const indeces = [];
      arr.filter((val, index) => {
        if (val.shipType === shipType) {
          indeces.push(index);
          return true;
        }
        return false;
      });
      shipBarGroups.push(indeces);
      usedIndeces.push(bar.shipType);
    });
    return shipBarGroups;
  }
  public isSafe(bar: HTMLElement, itemData: Ship, position: number) {
    if (this.checkFieldOverflow(bar, itemData, position) && this.checkNearShips(bar, itemData, position)) {
      return true;
    }
    return false;
  }
  public isSafeFlip(bar: HTMLElement, itemData: Ship, position: number) {
    const shipDataCopy = JSON.parse(JSON.stringify(itemData));
    shipDataCopy.orientation === 'horizontal' ? shipDataCopy.orientation = 'vertical' : shipDataCopy.orientation = 'horizontal';
    if (this.checkFieldOverflow(bar, shipDataCopy, position) && this.checkNearShips(bar, shipDataCopy, position)) {
      return true;
    }
    return false;
  }
  public getBarsConfig() {
    return this.bars
      .map((bar, index) => {
        if (bar.isBusy) {
          return {
            isBusy: bar.isBusy,
            shipType: bar.shipType,
            index: index
          };
        }
        return bar;
      })
      .filter(bar => bar.isBusy);
  }
  private checkFieldOverflow(bar: HTMLElement, itemData: Ship, position: number): boolean {

    const itemPosition = position;

    if (itemData.barsCount === 2) {
      if (itemData.orientation === 'vertical') {
        if (itemPosition - 10 < 0) return false;
      } else {
        if ((itemPosition - 1).toString().endsWith('0')) return false;
      }
    } else if (itemData.barsCount === 3) {
      if (itemData.orientation === 'vertical') {
        if (itemPosition - 10 < 0 || itemPosition + 10 > 100) return false;
      } else {
        if ((itemPosition - 1).toString().endsWith('0') || (itemPosition + 1).toString().endsWith('1')) return false;
      }
    } else if (itemData.barsCount === 4) {
      if (itemData.orientation === 'vertical') {
        if (itemPosition - 20 < 0 || itemPosition + 10 > 100) return false;
      } else {
        if ((itemPosition - 1).toString().endsWith('0')
          || (itemPosition + 1).toString().endsWith('0')
          || (itemPosition + 2).toString().endsWith('1')
          || (itemPosition).toString().endsWith('0')) {
          return false;
        }
      }
    }
    return true;
  }
  private checkNearShips(bar: HTMLElement, itemData: Ship, position: number): boolean {
    const itemPosition = position;
    const bars = this.fieldElement.children;

    if (itemData.barsCount === 2) {
      if (itemData.orientation === 'vertical') {
        if (bars[itemPosition - 11].children.length) return false;
      } else {
        if (bars[itemPosition - 2].children.length) return false;
      }
    } else if (itemData.barsCount === 3) {
      if (itemData.orientation === 'vertical') {
        if (bars[itemPosition - 11].children.length || bars[itemPosition + 9].children.length) return false;
      } else {
        if (bars[itemPosition - 2].children.length || bars[itemPosition].children.length) return false;
      }
    } else if (itemData.barsCount === 4) {
      if (itemData.orientation === 'vertical') {
        if (bars[itemPosition - 11].children.length || bars[itemPosition - 21].children.length || bars[itemPosition + 9].children.length) return false;
      } else {
        if (bars[itemPosition - 2].children.length || bars[itemPosition + 1].children.length || bars[itemPosition].children.length) return false;
      }
    }
    return true;
  }
}
