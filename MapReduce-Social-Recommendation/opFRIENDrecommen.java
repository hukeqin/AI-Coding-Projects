import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import java.util.*;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.Writable;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class opFRIENDrecommen {

    // Custom Writable Data Type
    static public class FriendCountWritable implements Writable {
        public Long user;
        public Long mutualFriend;

        public FriendCountWritable(Long user, Long mutualFriend) {
            this.user = user;
            this.mutualFriend = mutualFriend;
        }

        public FriendCountWritable() { this(-1L, -1L); }

        @Override
        public void write(DataOutput out) throws IOException {
            out.writeLong(user);
            out.writeLong(mutualFriend);
        }

        @Override
        public void readFields(DataInput in) throws IOException {
            user = in.readLong();
            mutualFriend = in.readLong();
        }
    }

    public static class FriendMapper extends Mapper<LongWritable, Text, LongWritable, FriendCountWritable> {
        
        // Innovation 1: Set a threshold to prevent data skew from "Super Nodes"
        private static final int MAX_FRIENDS = 500; 

        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            String line[] = value.toString().split("\t");
            
            // Data Cleaning
            if (line.length == 2) {
                Long fromUser = Long.parseLong(line[0]);
                List<Long> toUsers = new ArrayList<>();

                StringTokenizer tokenizer = new StringTokenizer(line[1], ",");
                while (tokenizer.hasMoreTokens()) {
                    toUsers.add(Long.parseLong(tokenizer.nextToken()));
                }

                // Handling Data Skew via Truncation
                if (toUsers.size() > MAX_FRIENDS) {
                    toUsers = toUsers.subList(0, MAX_FRIENDS);
                }

                // 1. Mark direct friends
                for (Long toUser : toUsers) {
                    context.write(new LongWritable(fromUser), new FriendCountWritable(toUser, -1L));
                }

                // 2. Generate potential recommendations
                for (int i = 0; i < toUsers.size(); i++) {
                    for (int j = i + 1; j < toUsers.size(); j++) {
                        context.write(new LongWritable(toUsers.get(i)), new FriendCountWritable((toUsers.get(j)), fromUser));
                        context.write(new LongWritable(toUsers.get(j)), new FriendCountWritable((toUsers.get(i)), fromUser));
                    }
                }
            }
        }
    }

    public static class FriendReducer extends Reducer<LongWritable, FriendCountWritable, LongWritable, Text> {
        
        @Override
        public void reduce(LongWritable key, Iterable<FriendCountWritable> values, Context context)
                throws IOException, InterruptedException {
            
            final Map<Long, List<Long>> mutualFriends = new HashMap<>();

            for (FriendCountWritable val : values) {
                final Boolean isAlreadyFriend = (val.mutualFriend == -1);
                final Long toUser = val.user;
                final Long mutualFriend = val.mutualFriend;

                if (mutualFriends.containsKey(toUser)) {
                    if (isAlreadyFriend) {
                        mutualFriends.put(toUser, null); 
                    } else if (mutualFriends.get(toUser) != null) {
                        mutualFriends.get(toUser).add(mutualFriend);
                    }
                } else {
                    if (!isAlreadyFriend) {
                        List<Long> list = new ArrayList<>();
                        list.add(mutualFriend);
                        mutualFriends.put(toUser, list);
                    } else {
                        mutualFriends.put(toUser, null);
                    }
                }
            }

            // Innovation 2: Top-K Recommendation
            int K = 10;
            
            Comparator<Map.Entry<Long, List<Long>>> comparator = new Comparator<Map.Entry<Long, List<Long>>>() {
                @Override
                public int compare(Map.Entry<Long, List<Long>> e1, Map.Entry<Long, List<Long>> e2) {
                    int v1 = e1.getValue().size();
                    int v2 = e2.getValue().size();
                    if (v1 != v2) {
                        return Integer.compare(v2, v1); // Descending order
                    }
                    return Long.compare(e1.getKey(), e2.getKey());
                }
            };

            List<Map.Entry<Long, List<Long>>> allRecommendations = new ArrayList<>();
            for (Map.Entry<Long, List<Long>> entry : mutualFriends.entrySet()) {
                if (entry.getValue() != null) {
                    allRecommendations.add(entry);
                }
            }

            allRecommendations.sort(comparator);
            
            if (allRecommendations.size() > K) {
                allRecommendations = allRecommendations.subList(0, K);
            }

            StringBuilder output = new StringBuilder();
            boolean isFirst = true;
            for (Map.Entry<Long, List<Long>> entry : allRecommendations) {
                if (!isFirst) output.append(",");
                output.append(entry.getKey());
                output.append(" (");
                output.append(entry.getValue().size());
                output.append(": ").append(entry.getValue().toString()); 
                output.append(")");
                isFirst = false;
            }

            if (output.length() > 0) {
                context.write(key, new Text(output.toString()));
            }
        }
    }

    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "Optimized Friend Recommendation");
        
        // Ensure the class name matches the filename
        job.setJarByClass(opFRIENDrecommen.class);
        
        job.setMapperClass(FriendMapper.class);
        job.setReducerClass(FriendReducer.class);
        job.setMapOutputKeyClass(LongWritable.class);
        job.setMapOutputValueClass(FriendCountWritable.class);
        job.setOutputKeyClass(LongWritable.class);
        job.setOutputValueClass(Text.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}