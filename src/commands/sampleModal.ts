import { App } from 'obsidian';
import { SampleModal } from '@/ui/SampleModal';

export function openSampleModal(app: App): void {
	new SampleModal(app).open();
}
