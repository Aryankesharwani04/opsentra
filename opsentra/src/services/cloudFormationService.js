'use strict';

const config = require('../config/env');

/**
 * CloudFormation Template Generator for Opsentra IAM Role.
 *
 * Generates a ready-to-deploy AWS CloudFormation template that:
 *  1. Creates an IAM Role `OpsentraCloudWatchAccess`
 *  2. Adds a trust policy allowing Opsentra's AWS account to assume the role
 *  3. Grants the minimal CloudWatch Logs permissions required for log ingestion
 *
 * Users can deploy this via:
 *  - Console "Launch Stack" button (using the template URL)
 *  - AWS CLI: aws cloudformation deploy --template-file ...
 *  - CDK / Terraform import
 */

/**
 * Opsentra's AWS account ID.
 * Loaded from OPSENTRA_AWS_ACCOUNT_ID env var — used as the trusted principal
 * in the IAM role's trust policy.
 */
const OPSENTRA_ACCOUNT_ID = config.aws.opsentraAccountId || '123456789012'; // fallback for dev

/**
 * CloudWatch Logs permissions required by Opsentra for log ingestion.
 * Principle of least privilege — read-only access only.
 */
const CLOUDWATCH_LOG_ACTIONS = [
  'logs:DescribeLogGroups',
  'logs:DescribeLogStreams',
  'logs:GetLogEvents',
  'logs:FilterLogEvents',
];

/**
 * Generate the CloudFormation JSON template.
 *
 * @param {object} [options]
 * @param {string} [options.roleName='OpsentraCloudWatchAccess'] - IAM role name
 * @param {string} [options.externalId]  - Optional ExternalId for extra security (recommended for prod)
 * @param {string[]} [options.actions]   - Override default log permissions
 * @param {string} [options.region]      - AWS region hint added to template metadata
 * @returns {object} CloudFormation template object (ready to JSON.stringify)
 */
const generateIamRoleTemplate = ({
  roleName = 'OpsentraCloudWatchAccess',
  externalId = null,
  actions = CLOUDWATCH_LOG_ACTIONS,
  region = 'us-east-1',
} = {}) => {
  // Build the trust policy statement
  const trustStatement = {
    Effect: 'Allow',
    Principal: {
      AWS: `arn:aws:iam::${OPSENTRA_ACCOUNT_ID}:root`,
    },
    Action: 'sts:AssumeRole',
  };

  // Add ExternalId condition if provided (prevents "confused deputy" attacks)
  if (externalId) {
    trustStatement.Condition = {
      StringEquals: {
        'sts:ExternalId': externalId,
      },
    };
  }

  return {
    AWSTemplateFormatVersion: '2010-09-09',
    Description:
      'Creates an IAM role that grants Opsentra read-only access to CloudWatch Logs for monitoring your AWS infrastructure.',

    Metadata: {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [],
        ParameterLabels: {},
      },
      OpsentraVersion: '1.0',
      DeployedAt: new Date().toISOString(),
      Region: region,
    },

    Resources: {
      OpsentraCloudWatchRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: roleName,
          Description: 'Allows Opsentra to read CloudWatch Logs for server instance monitoring.',

          // Trust policy — specifies who can assume this role
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [trustStatement],
          },

          // Inline policy with least-privilege CloudWatch Logs permissions
          Policies: [
            {
              PolicyName: 'OpsentraCloudWatchLogsReadOnly',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Sid: 'OpsentraCloudWatchLogsAccess',
                    Effect: 'Allow',
                    Action: actions,
                    Resource: '*', // Required — CloudWatch Logs doesn't support resource-level restrictions for Describe/Get calls
                  },
                ],
              },
            },
          ],

          Tags: [
            { Key: 'ManagedBy', Value: 'Opsentra' },
            { Key: 'Purpose', Value: 'CloudWatch Logs Monitoring' },
            { Key: 'CreatedAt', Value: new Date().toISOString() },
          ],
        },
      },
    },

    Outputs: {
      RoleArn: {
        Description: 'The ARN of the Opsentra IAM role. Copy this and paste it into Opsentra to complete the connection.',
        Value: { 'Fn::GetAtt': ['OpsentraCloudWatchRole', 'Arn'] },
        Export: {
          Name: `${roleName}-Arn`,
        },
      },
      RoleName: {
        Description: 'The name of the Opsentra IAM role.',
        Value: { Ref: 'OpsentraCloudWatchRole' },
      },
    },
  };
};

/**
 * Generate a CloudFormation quick-launch URL.
 * Encodes the template URL + stack name into the CloudFormation console URL.
 *
 * @param {string} templateUrl - Public S3 URL of the template (or leave null)
 * @param {string} [awsRegion='us-east-1'] - Target region for the console
 * @returns {string | null}
 */
const generateLaunchUrl = (templateUrl, awsRegion = 'us-east-1') => {
  if (!templateUrl) return null;
  const stackName = 'OpsentraIntegration';
  const base = `https://console.aws.amazon.com/cloudformation/home?region=${awsRegion}#/stacks/create/review`;
  return `${base}?templateURL=${encodeURIComponent(templateUrl)}&stackName=${stackName}`;
};

module.exports = { generateIamRoleTemplate, generateLaunchUrl, CLOUDWATCH_LOG_ACTIONS, OPSENTRA_ACCOUNT_ID };
