const questions = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers and a target value, return the indices of the two numbers that add up to the target.",
    difficulty: "easy",
    topics: ["array", "hashmap"],
    constraints: ["2 <= nums.length <= 10^4", "Exactly one valid answer exists"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] equals 9.",
      },
    ],
    sourceUrl: "https://leetcode.com/problems/two-sum/",
    imageUrl: null,
  },
  {
    title: "Course Schedule",
    description:
      "Given the number of courses and a list of prerequisite pairs, determine whether all courses can be finished.",
    difficulty: "medium",
    topics: ["graph", "topological-sort"],
    constraints: ["1 <= numCourses <= 2000"],
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation: "Course 0 can be taken before course 1.",
      },
    ],
    sourceUrl: "https://leetcode.com/problems/course-schedule/",
    imageUrl: null,
  },
];

export default questions;
