import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Post } from "../types/post";

const PostListItem = ({ post }: { post: Post }) => {
  return (
    <View>
      <Link href={`/${post.slug}`} style={{ fontSize: 24, fontWeight: "500" }}>
        {post.title}
      </Link>
    </View>
  );
};

export default PostListItem;
