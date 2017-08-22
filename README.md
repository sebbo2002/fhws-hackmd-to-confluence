# HackMD ➡ Confluence

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Status](https://git-badges.sebbo.net/65/master/build)](https://git.sebbo.net/fhws/hackmd-to-confluence/pipelines)

Small script to export a HackMD Pad to Confluence:

- Downloads the Markdown
- Renders the Markdown to HTML by using the GitHub Markdown API
- Replaces the Content of the given Confluence Page

### Installation

#### Directly

You'll need [node.js](https://nodejs.org/en/) to run this.

```bash
git clone https://github.com/sebbo2002/fhws-hackmd-to-confluence.git
cd ./fhws-hackmd-to-confluence
npm install
```

I use crontab to run this script regularly.


#### Docker

You can also use the docker container to run this script:

```bash
docker pull sebbo2002/fhws-hackmd-to-confluence
```


### Configuration

Use environment variables to set login credentials and pushover tokens:

<table>
    <tr>
        <th scope="row">HACKMD_PAD_URL</td>
        <td>Public HackMD URL of the Pad. Click on "Publish" in your HackMD to get it.</td>
    </tr>
    <tr>
        <th scope="row">CONFLUENCE_URL</td>
        <td>Your Confluence URL, for example https://confluence.student.fiw.fhws.de:8443 for the FHWS Confluence.</td>
    </tr>
    <tr>
        <th scope="row">CONFLUENCE_CONTENT_ID</td>
        <td>Numeric Confluence Content ID to replace content of.</td>
    </tr>
</table>

### Example

```bash
HACKMD_PAD_URL="https://pad.sebbo.net/s/*********" \
CONFLUENCE_URL="https://confluence.student.fiw.fhws.de:8443" \
CONFLUENCE_CONTENT_ID="1234567" node app
```
