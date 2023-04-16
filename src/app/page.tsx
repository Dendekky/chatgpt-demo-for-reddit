'use client';
import React, { useState, useEffect } from 'react';
import { Select, Button, List, Typography, Tag, Avatar, Space } from 'antd';
import styles from './page.module.css';
import { useDebounce } from 'use-debounce'; // Import useDebounce hook

const { Option } = Select;

const IndexPage: React.FC = () => {
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [posts, setPosts] = useState<Record<string, any>[]>([]);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000); // Use useDebounce hook with handleSearch function
  useEffect(
    () => {
      handleSearch(debouncedSearchTerm);
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  async function handleSearch(value: string) {
    try {
      // Fetch subreddits from Reddit API based on search query
      const response = await fetch(
        `https://www.reddit.com/subreddits/search.json?q=${value}`
      );
      const data = await response.json();
      // Extract subreddit names from API response and update subreddits state
      const extractedSubreddits =
        data?.data?.children?.map((child: any) => child?.data?.display_name) ||
        [];
      console.log(extractedSubreddits);
      setSubreddits(extractedSubreddits);
    } catch (error) {
      console.error('Error fetching subreddits from Reddit API:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Fetch data from Reddit API based on selected subreddits and timeframe
      const response = await fetch(
        `https://www.reddit.com/r/${selectedSubs.join(
          '+'
        )}/top.json?t=${timeframe}`
      );
      const data = await response.json();
      // Extract posts from API response and update posts state
      const extractedPosts = data?.data?.children?.map(
        (child: any) => child?.data
      );
      setPosts(extractedPosts);
    } catch (error) {
      console.error('Error fetching data from Reddit API:', error);
    }
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Reddit App</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor='subreddit' className={styles.label}>
          Select Subreddit:
        </label>
        <Select
          id='subreddit'
          className={styles.select}
          mode='multiple' // Enable multiple selections
          value={selectedSubs}
          onSearch={(value) => setSearchTerm(value)} // Fetch subreddits based on search query
          onChange={(value) => setSelectedSubs(value)}
        >
          {/* Render subreddit options from subreddits state */}
          {subreddits.map((sub, index) => (
            <Option key={index} value={sub}>
              {sub}
            </Option>
          ))}
        </Select>
        {/* Render input fields for timeframe selection */}
        <label htmlFor='subreddit' className={styles.label}>
          Select Period:
        </label>
        <Select
          id='subreddit'
          className={styles.select}
          value={timeframe}
          onChange={(value) => setTimeframe(value)}
          options={[
            { value: '12h', label: '12 hours' },
            { value: '1d', label: '1 day' },
            { value: '3d', label: '3 days' },
            { value: '1w', label: '1 week',  },
          ]}
        />
        <Button type='primary' htmlType='submit' className={styles.button}>
          Fetch Data
        </Button>
      </form>
      {/* Render the fetched posts */}
      <List
        dataSource={posts}
        renderItem={(post, index) => (
          <List.Item
            key={index}
            className={styles.post}
            extra={
              <Space direction='vertical' style={{ marginLeft: 12 }}>
                <Tag>{post.subreddit_name_prefixed}</Tag>
                <Typography.Text>
                  {new Date(
                    (post.edited || post.created) * 1000
                  ).toLocaleString()}
                </Typography.Text>
              </Space>
            }
          >
            <List.Item.Meta
              avatar={<Avatar src={post.thumbnail}>SR</Avatar>}
              title={
                <a href={`https://www.reddit.com${post.permalink}`}>
                  {post.title}
                </a>
              }
              description={
                <Typography.Text ellipsis={true}>
                  {post.selftext}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default IndexPage;
