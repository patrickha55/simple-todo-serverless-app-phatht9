import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify, decode } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import Axios from 'axios';
import { Jwt } from '../../auth/Jwt';
import { JwtPayload } from '../../auth/JwtPayload';
import { config } from '../../utils/config';

const logger = createLogger('auth');

const jwksUrl = 'https://dev-qcygqyyjkj6m7ese.us.auth0.com/.well-known/jwks.json';

export const handler = async (
    event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken);
    try {
        const jwtToken = await verifyToken(event.authorizationToken);
        logger.info('User was authorized', jwtToken);

        return generatePolicy(jwtToken.sub, '*', 'Allow');
    } catch (e) {
        logger.error('User not authorized', { error: e.message });

        return generatePolicy('user', '*', 'Deny');;
    }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader);

    const certInfo: string = await getCertInfo();

    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    return verify(token, certInfo, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return token;
}

/**
 * Get a singing certificate form Auth0
 */
async function getCertInfo(): Promise<string> {
    try {
        const response = await Axios.get(jwksUrl);
        const data: string = response['data']['key'][0]['x5c'][0];
        return certToPEM(data);
    } catch (error) {
        logger.error(`Can't fetch the Authentication certificate. Error: `, JSON.stringify(error));
    }
}

/**
 * Convert JWKS cert to PEM
 * @param cert 
 * @returns 
 */
export function certToPEM(cert: string): string {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}

/**
 * Generate an api gateway authorizer policy for authentication.
 * @param principalId An id of a user
 * @param resource Resources an user can access. Pass in '*' for all resources.
 * @param effect Allow or Deny.
 * @returns A policy for api gateway.
 */
function generatePolicy(
    principalId: string,
    resource: string,
    effect: string
): CustomAuthorizerResult {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
}
