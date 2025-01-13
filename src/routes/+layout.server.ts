import crypto from 'node:crypto';

import { getFeatureFlag } from '$lib/experiments';
import { getAllChangelogEntries } from './changelog/utils';

export const trailingSlash = 'never';

const generateDistinctId = (fingerprintData: Record<string, string>) => {
    return crypto.createHash('sha256').update(JSON.stringify(fingerprintData)).digest('hex');
};

export const load = async ({ request, getClientAddress }) => {
    const clientAddress = getClientAddress();
    const headers = Object.fromEntries(request.headers);
    const fingerprintData = {
        ip: clientAddress,
        userAgent: headers['user-agent'],
        acceptLanguage: headers['accept-language'],
        platform: headers['sec-ch-ua-platform'],
        mobile: headers['sec-ch-ua-mobile'],
        browserBrand: headers['sec-ch-ua']
    };

    const distinctId = generateDistinctId(fingerprintData);

    const isStickyNav = await getFeatureFlag<'sticky-navigation_ab-test'>(
        'sticky-navigation_ab-test',
        'sticky-nav',
        distinctId
    );

    return {
        distinctId,
        isStickyNav,
        changelogEntries: (await getAllChangelogEntries()).length
    };
};
