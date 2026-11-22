import { isBlockedYouTube } from '../shared/classify';
import { startGuard } from '../shared/guard';

startGuard(isBlockedYouTube);
