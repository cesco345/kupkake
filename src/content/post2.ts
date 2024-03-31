import { Post } from '../types/post';

const post: Post = {
  slug: 'post2',
  date: '2024-02-28T13:27:28Z',
  title: 'My Second Post',
  description: 'This is the second post in my app.',
  thumbnail: 'post2.jpeg',
  content: `# Abit tecum

  
  {
    "cells": [
     {
      "cell_type": "markdown",
      "id": "dcce2f51",
      "metadata": {},
      "source": [
       "# Encapsulates pattern and associated Boyer-Moore preprocessing."
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 1,
      "id": "d46d46fb",
      "metadata": {},
      "outputs": [],
      "source": [
       "\n",
       "#Implementing the Boyer-Moore Algorithm: Encapsulates pattern and associated Boyer-Moore preprocessing.\n",
       "\n",
       "import string\n",
       "\n",
       "\n",
       "def z_array(s):\n",
       "    \"\"\" Use Z algorithm (Gusfield theorem 1.4.1) to preprocess s \"\"\"\n",
       "    assert len(s) > 1\n",
       "    z = [len(s)] + [0] * (len(s)-1)\n",
       "\n",
       "    # Initial comparison of s[1:] with prefix\n",
       "    for i in range(1, len(s)):\n",
       "        if s[i] == s[i-1]:\n",
       "            z[1] += 1\n",
       "        else:\n",
       "            break\n",
       "    \n",
       "    r, l = 0, 0\n",
       "    if z[1] > 0:\n",
       "        r, l = z[1], 1\n",
       "\n",
       "    for k in range(2, len(s)):\n",
       "        assert z[k] == 0\n",
       "        if k > r:\n",
       "            # Case 1\n",
       "            for i in range(k, len(s)):\n",
       "                if s[i] == s[i-k]:\n",
       "                    z[k] += 1\n",
       "                else:\n",
       "                    break\n",
       "            r, l = k + z[k] - 1, k\n",
       "        else:\n",
       "            # Case 2\n",
       "            # Calculate length of beta\n",
       "            nbeta = r - k + 1\n",
       "            zkp = z[k - l]\n",
       "            if nbeta > zkp:\n",
       "                # Case 2a: zkp wins\n",
       "                z[k] = zkp\n",
       "            else:\n",
       "                # Case 2b: Compare characters just past r\n",
       "                nmatch = 0\n",
       "                for i in range(r+1, len(s)):\n",
       "                    if s[i] == s[i - k]:\n",
       "                        nmatch += 1\n",
       "                    else:\n",
       "                        break\n",
       "                l, r = k, r + nmatch\n",
       "                z[k] = r - k + 1\n",
       "    return z\n",
       "\n",
       "\n",
       "def n_array(s):\n",
       "    \"\"\" Compile the N array (Gusfield theorem 2.2.2) from the Z array \"\"\"\n",
       "    return z_array(s[::-1])[::-1]\n",
       "\n",
       "\n",
       "def big_l_prime_array(p, n):\n",
       "    \"\"\" Compile L' array (Gusfield theorem 2.2.2) using p and N array.\n",
       "        L'[i] = largest index j less than n such that N[j] = |P[i:]| \"\"\"\n",
       "    lp = [0] * len(p)\n",
       "    for j in range(len(p)-1):\n",
       "        i = len(p) - n[j]\n",
       "        if i < len(p):\n",
       "            lp[i] = j + 1\n",
       "    return lp\n",
       "\n",
       "\n",
       "def big_l_array(p, lp):\n",
       "    \"\"\" Compile L array (Gusfield theorem 2.2.2) using p and L' array.\n",
       "        L[i] = largest index j less than n such that N[j] >= |P[i:]| \"\"\"\n",
       "    l = [0] * len(p)\n",
       "    l[1] = lp[1]\n",
       "    for i in range(2, len(p)):\n",
       "        l[i] = max(l[i-1], lp[i])\n",
       "    return l\n",
       "\n",
       "\n",
       "def small_l_prime_array(n):\n",
       "    \"\"\" Compile lp' array (Gusfield theorem 2.2.4) using N array. \"\"\"\n",
       "    small_lp = [0] * len(n)\n",
       "    for i in range(len(n)):\n",
       "        if n[i] == i+1:  # prefix matching a suffix\n",
       "            small_lp[len(n)-i-1] = i+1\n",
       "    for i in range(len(n)-2, -1, -1):  # \"smear\" them out to the left\n",
       "        if small_lp[i] == 0:\n",
       "            small_lp[i] = small_lp[i+1]\n",
       "    return small_lp\n",
       "\n",
       "\n",
       "def good_suffix_table(p):\n",
       "    \"\"\" Return tables needed to apply good suffix rule. \"\"\"\n",
       "    n = n_array(p)\n",
       "    lp = big_l_prime_array(p, n)\n",
       "    return lp, big_l_array(p, lp), small_l_prime_array(n)\n",
       "\n",
       "\n",
       "def good_suffix_mismatch(i, big_l_prime, small_l_prime):\n",
       "    \"\"\" Given a mismatch at offset i, and given L/L' and l' arrays,\n",
       "        return amount to shift as determined by good suffix rule. \"\"\"\n",
       "    length = len(big_l_prime)\n",
       "    assert i < length\n",
       "    if i == length - 1:\n",
       "        return 0\n",
       "    i += 1  # i points to leftmost matching position of P\n",
       "    if big_l_prime[i] > 0:\n",
       "        return length - big_l_prime[i]\n",
       "    return length - small_l_prime[i]\n",
       "\n",
       "\n",
       "def good_suffix_match(small_l_prime):\n",
       "    \"\"\" Given a full match of P to T, return amount to shift as\n",
       "        determined by good suffix rule. \"\"\"\n",
       "    return len(small_l_prime) - small_l_prime[1]\n",
       "\n",
       "\n",
       "def dense_bad_char_tab(p, amap):\n",
       "    \"\"\" Given pattern string and list with ordered alphabet characters, create\n",
       "        and return a dense bad character table.  Table is indexed by offset\n",
       "        then by character. \"\"\"\n",
       "    tab = []\n",
       "    nxt = [0] * len(amap)\n",
       "    for i in range(0, len(p)):\n",
       "        c = p[i]\n",
       "        assert c in amap\n",
       "        tab.append(nxt[:])\n",
       "        nxt[amap[c]] = i+1\n",
       "    return tab\n",
       "\n",
       "class BoyerMoore(object):\n",
       "    \"\"\" Encapsulates pattern and associated Boyer-Moore preprocessing. \"\"\"\n",
       "\n",
       "    def __init__(self, p, alphabet='ACGT'):\n",
       "        # Create map from alphabet characters to integers\n",
       "        self.amap = {alphabet[i]: i for i in range(len(alphabet))}\n",
       "        # Make bad character rule table\n",
       "        self.bad_char = dense_bad_char_tab(p, self.amap)\n",
       "        # Create good suffix rule table\n",
       "        _, self.big_l, self.small_l_prime = good_suffix_table(p)\n",
       "\n",
       "    def bad_character_rule(self, i, c):\n",
       "        \"\"\" Return # skips given by bad character rule at offset i \"\"\"\n",
       "        assert c in self.amap\n",
       "        assert i < len(self.bad_char)\n",
       "        ci = self.amap[c]\n",
       "        return i - (self.bad_char[i][ci]-1)\n",
       "\n",
       "    def good_suffix_rule(self, i):\n",
       "        \"\"\" Given a mismatch at offset i, return amount to shift\n",
       "            as determined by (weak) good suffix rule. \"\"\"\n",
       "        length = len(self.big_l)\n",
       "        assert i < length\n",
       "        if i == length - 1:\n",
       "            return 0\n",
       "        i += 1  # i points to leftmost matching position of P\n",
       "        if self.big_l[i] > 0:\n",
       "            return length - self.big_l[i]\n",
       "        return length - self.small_l_prime[i]\n",
       "\n",
       "    def match_skip(self):\n",
       "        \"\"\" Return amount to shift in case where P matches T \"\"\"\n",
       "        return len(self.small_l_prime) - self.small_l_prime[1]"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "c6ecf460",
      "metadata": {},
      "source": [
       "# Testing the Bad Character Rule of the Boyer-Moore Algorithm"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 2,
      "id": "3f14d592",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "2"
         ]
        },
        "execution_count": 2,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "# GCTAGCTC\n",
       "# TCAA\n",
       "\n",
       "# We expect to skip an offset of two positions until the 'T' matches\n",
       "\n",
       "p = 'TCAA'\n",
       "p_bm = BoyerMoore(p)\n",
       "p_bm.bad_character_rule(2, 'T')"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "e6e84e13",
      "metadata": {},
      "source": [
       "# Testing the Good Suffix Rule of the Boyer-Moore Algorithm"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 4,
      "id": "02a6029f",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "3"
         ]
        },
        "execution_count": 4,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "# GCTAGCTC\n",
       "# ACTA\n",
       "\n",
       "# We expect to skip an offset of two positions until the 'T' matches\n",
       "\n",
       "p = 'ACTA'\n",
       "p_bm = BoyerMoore(p)\n",
       "p_bm.good_suffix_rule(0)"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "a7cdb93c",
      "metadata": {},
      "source": [
       "# Testing Match Skip of the Boyer-Moore Algorithm"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 6,
      "id": "7050d081",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "2"
         ]
        },
        "execution_count": 6,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "# GCTAGCTC\n",
       "# ACAC\n",
       "\n",
       "# We expect to skip an offset of two positions until the 'T' matches\n",
       "\n",
       "p = 'ACAC'\n",
       "p_bm = BoyerMoore(p)\n",
       "p_bm.match_skip()"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "647721ec",
      "metadata": {},
      "source": [
       "# Adding the Matching Function"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 7,
      "id": "d65c5ec7",
      "metadata": {},
      "outputs": [],
      "source": [
       "def boyer_moore(p, p_bm, t):\n",
       "    \"\"\" Do Boyer-Moore matching \"\"\"\n",
       "    i = 0\n",
       "    occurrences = []\n",
       "    while i < len(t) - len(p) + 1:\n",
       "        shift = 1\n",
       "        mismatched = False\n",
       "        for j in range(len(p)-1, -1, -1):\n",
       "            if p[j] != t[i+j]:\n",
       "                skip_bc = p_bm.bad_character_rule(j, t[i+j])\n",
       "                skip_gs = p_bm.good_suffix_rule(j)\n",
       "                shift = max(shift, skip_bc, skip_gs)\n",
       "                mismatched = True\n",
       "                break\n",
       "        if not mismatched:\n",
       "            occurrences.append(i)\n",
       "            skip_gs = p_bm.match_skip()\n",
       "            shift = max(shift, skip_gs)\n",
       "        i += shift\n",
       "    return occurrences"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 8,
      "id": "43b163fc",
      "metadata": {},
      "outputs": [],
      "source": [
       "t = 'GCTACGATCTAGAATCTA'\n",
       "p = 'TCTA'\n",
       "p_bm = BoyerMoore(p)"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 10,
      "id": "18671e96",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "[7, 14]"
         ]
        },
        "execution_count": 10,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "boyer_moore(p, p_bm, t)"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 11,
      "id": "b51605a1",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "'TCTA'"
         ]
        },
        "execution_count": 11,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "# double check to make sure it found the right pattern at the right offset\n",
       "t[7:11]"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 12,
      "id": "6f39fa3d",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "'TCTA'"
         ]
        },
        "execution_count": 12,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "t[14:18]"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "32b9e362",
      "metadata": {},
      "source": [
       "# Ordered Structures and Binary Search Algorithm"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 22,
      "id": "56bc6825",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "1"
         ]
        },
        "execution_count": 22,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "import bisect\n",
       "\n",
       "#leftmost offset where x can be inserted int a to maintain order\n",
       "a = [1,3,3,6,8,8,9,10]\n",
       "bisect.bisect_left(a,2)"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 23,
      "id": "48c5bb45",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "3"
         ]
        },
        "execution_count": 23,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "bisect.bisect_left(a,4)"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 24,
      "id": "63c753d1",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "4"
         ]
        },
        "execution_count": 24,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "bisect.bisect_left(a,8)"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "de9f6d33",
      "metadata": {},
      "source": [
       "# Hash Tables for Indexing"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 25,
      "id": "3d07f0b2",
      "metadata": {},
      "outputs": [],
      "source": [
       "#python dictionary\n",
       "t = 'GTGCGTGTGGGGG'\n",
       "table = {'GTG' : [0, 4, 6], 'TGC' : [1],\n",
       "         'GCG' : [2], 'CGT' : [3], 'TGT' : [5],\n",
       "         'TGG' : [7], 'GGG' : [8, 9, 10]}"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 26,
      "id": "037c5437",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "[8, 9, 10]"
         ]
        },
        "execution_count": 26,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "table['GGG']"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 27,
      "id": "9ac793dc",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "[3]"
         ]
        },
        "execution_count": 27,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "table['CGT']"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 28,
      "id": "ed1825e4",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "[0, 4, 6]"
         ]
        },
        "execution_count": 28,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "table['GTG']"
      ]
     },
     {
      "cell_type": "markdown",
      "id": "e75a6aef",
      "metadata": {},
      "source": [
       "# Implementing a K-MER Index e.g.dimer, trimer, tetramer, ..."
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 29,
      "id": "a2eab11f",
      "metadata": {},
      "outputs": [],
      "source": [
       "import bisect\n",
       "import sys\n",
       "\n",
       "class Index(object):\n",
       "    def __init__(self, t, k):\n",
       "        ''' Create index from all substrings of size 'length' '''\n",
       "        self.k = k  # k-mer length (k)\n",
       "        self.index = []\n",
       "        for i in range(len(t) - k + 1):  # for each k-mer\n",
       "            self.index.append((t[i:i+k], i))  # add (k-mer, offset) pair\n",
       "        self.index.sort()  # alphabetize by k-mer\n",
       "    \n",
       "    def query(self, p):\n",
       "        ''' Return index hits for first k-mer of P '''\n",
       "        kmer = p[:self.k]  # query with first k-mer\n",
       "        i = bisect.bisect_left(self.index, (kmer, -1))  # binary search\n",
       "        hits = []\n",
       "        while i < len(self.index):  # collect matching index entries\n",
       "            if self.index[i][0] != kmer:\n",
       "                break\n",
       "            hits.append(self.index[i][1])\n",
       "            i += 1\n",
       "        return hits[:]"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 30,
      "id": "70093201",
      "metadata": {},
      "outputs": [],
      "source": [
       "def queryIndex(p, t, index):\n",
       "    k = index.k\n",
       "    offsets = []\n",
       "    for i in index.query(p):\n",
       "        if p[k:] == t[i+k:i+len(p)]:  # verify that rest of P matches\n",
       "            offsets.append(i)\n",
       "    return offsets"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 31,
      "id": "de2493a4",
      "metadata": {},
      "outputs": [],
      "source": [
       "t = 'ACTTGGAGATCTTTGAGGCTAGGTATTCGGGATCGAAGCTCATTTCGGGGATCGATTACGATATGGTGGGTATTCGGGA'\n",
       "p = 'GGTATTCGGGA'"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 32,
      "id": "f9138ea9",
      "metadata": {},
      "outputs": [
       {
        "name": "stdout",
        "output_type": "stream",
        "text": [
         "[21, 68]\n"
        ]
       }
      ],
      "source": [
       "index = Index(t, 4)\n",
       "print(queryIndex(p, t, index))"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 35,
      "id": "93f3617d",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "'GGTATTCGGGA'"
         ]
        },
        "execution_count": 35,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "#verify\n",
       "t[21:32]"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 39,
      "id": "991584cf",
      "metadata": {},
      "outputs": [
       {
        "data": {
         "text/plain": [
          "'GGTATTCGGGA'"
         ]
        },
        "execution_count": 39,
        "metadata": {},
        "output_type": "execute_result"
       }
      ],
      "source": [
       "#verify\n",
       "t[68:79]"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": 40,
      "id": "5e6c86d8",
      "metadata": {},
      "outputs": [
       {
        "name": "stdout",
        "output_type": "stream",
        "text": [
         "[8, 24, 31, 41, 50, 54, 60, 62, 71]\n"
        ]
       }
      ],
      "source": [
       "index = Index(t, 2)\n",
       "print(queryIndex('AT', t, index))"
      ]
     },
     {
      "cell_type": "code",
      "execution_count": null,
      "id": "d1c4f7d1",
      "metadata": {},
      "outputs": [],
      "source": []
     }
    ],
    "metadata": {
     "kernelspec": {
      "display_name": "Python 3 (ipykernel)",
      "language": "python",
      "name": "python3"
     },
     "language_info": {
      "codemirror_mode": {
       "name": "ipython",
       "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name": "python",
      "nbconvert_exporter": "python",
      "pygments_lexer": "ipython3",
      "version": "3.8.10"
     }
    },
    "nbformat": 4,
    "nbformat_minor": 5
   }
  `,
};

export default post;