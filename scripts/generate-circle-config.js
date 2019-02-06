const path = require('path');
const fs = require('fs');
const yaml = require('write-yaml');


function createJSON(fileArray, data) {
  for (let [index, value] of fileArray.entries()) {
    data.jobs[`test${index + 1}`] = {
      working_directory: '~/app',
      docker: [
        {
          image: 'cypress/base:8',
          environment: {
            TERM: 'xterm',
          }
        },
      ],
      steps: [
        {
          attach_workspace: {
            at: '~/',
          }
        },
        {
          run: 'ls -la cypress',
        },
        {
          run: 'ls -la cypress/integration',
        },
        {
          run: {
            name: `Running E2E tests ${index + 1}`,
            command: `$(npm bin)/cypress run --spec cypress/integration/${value}'`,
          }
        },
        {
          store_test_results: {
            path: 'reports',
          }
        },
        {
          store_artifacts: {
            path: 'reports',
          }
        },
        {
          store_artifacts: {
            path: 'cypress/videos',
          }
        },
        {
          store_artifacts: {
            path: 'cypress/screenshots',
          }
        }
      ]
    }
    data.workflows.build_and_test.jobs.push({
      [`test${index + 1}`]: {
        "requires": [
          "build"
        ]
      }
    })
  }
  return data;
}

function writeFile(data) {
  yaml('circle.yml', data, function(err) {
    if (err) {
      console.log(err)
    } else {
      console.log('Success!')
    }
  });

}

// main

const files = fs.readdirSync(path.join('cypress', 'integration')).filter(fn => fn.endsWith('.spec.js'));
const circleConfigJSONLFilePath = require('./circle.json');
const data = createJSON(files, circleConfigJSONLFilePath)
writeFile(data);