import { Pipe, PipeTransform } from '@angular/core';
import { ConfigHelpDocumentModel } from 'src/app/_models/ConfigurationModel';

@Pipe({
  name: 'filterDocs'
})
export class FilterDocsPipe implements PipeTransform {
  transform(items: ConfigHelpDocumentModel[], searchText: string): ConfigHelpDocumentModel[] {
    if (!items) return [];
    if (!searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter(item =>
      item.documentName?.toLowerCase().includes(searchText) ||
      item.description?.toLowerCase().includes(searchText)
    );
  }
}
