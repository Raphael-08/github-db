import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_REPO_OWNER;
const REPO = process.env.GITHUB_REPO_NAME;

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

export async function getFileSha(path: string, branch: string = 'main'): Promise<string> {
    try {
      const { data } = await octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
        ref: branch,
      });
  
      if ('sha' in data) {
        return data.sha;
      }
      throw new Error('SHA not found in file data');
    } catch (error) {
      console.error('Error fetching file SHA:', error);
      throw error;
    }
  }

export async function read(path: string, branch: string = 'main'): Promise<string> {
    try {
        const { data } = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path,
            ref: branch,
        });

        if ('content' in data) {
            const content = Buffer.from(data.content, 'base64').toString('utf8');
            return content;
        }

        throw new Error('Content not found in file data');
    } catch (error) {
        console.error('Error fetching file:', error);
        throw error;
    }
}

export async function write(path: string, content: string, message: string, branch: string = 'main'): Promise<void | string> {
    try {
        const fileContent = Buffer.from(content).toString('base64');

        await octokit.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path,
            message,
            content: fileContent,
            branch,
        });

    } catch (error) {
        return error
    }
}

export async function update(path: string, content: string, message: string, branch: string = 'main'): Promise<void | string> {
  const sha = await getFileSha(path, branch);
  try {
      const fileContent = Buffer.from(content).toString('base64');

      await octokit.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path,
          message,
          content: fileContent,
          branch,
          sha
      });

  } catch (error) {
      return error
  }
}

export async function deleteFile(path: string, branch: string = 'main'): Promise<void> {
    try {
      const sha = await getFileSha(path, branch);
      const message = `Delete file ${path}`;
  
      await octokit.repos.deleteFile({
        owner: OWNER,
        repo: REPO,
        path,
        message,
        sha,
        branch,
      });
  
      console.log(`File '${path}' deleted successfully`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }