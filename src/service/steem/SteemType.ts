export interface SteemVote {
    percent: number,
    reputation: string,
    rshares: number | string,
    time: string,
    voter: string,
    weight: number
}

export interface SteemReplies {
    bs_rshares: number,
    active: string,
    active_votes: SteemVote[],
    allow_curation_rewards: boolean,
    allow_replies: boolean,
    allow_votes: boolean,
    author: string,
    author_reputation: string,
    author_rewards: number,
    beneficiaries: any[],
    body: string,
    body_length: number,
    cashout_time: string,
    category: string,
    children: number,
    children_abs_rshares: number,
    created: string,
    curator_payout_value: string,
    depth: number,
    id: number,
    json_metadata: string,
    last_payout: string,
    last_update: string,
    max_accepted_payout: string,
    max_cashout_time: string,
    net_rshares: number,
    net_votes: number,
    parent_author: string,
    parent_permlink: string,
    pending_payout_value: string,
    percent_steem_dollars: number,
    permlink: string,
    promoted: string,
    reblogged_by: any[],
    replies: any[],
    reward_weight: number,
    root_author: string,
    root_permlink: string,
    root_title: string,
    title: string,
    total_payout_value: string,
    total_pending_payout_value: string,
    total_vote_weight: number,
    url: string,
    vote_rshares: number,
}

export interface SteemAccount {
    active: any,
    average_bandwidth: string,
    average_market_bandwidth: number,
    balance: string,
    can_vote: boolean,
    comment_count: number,
    created: string,
    curation_rewards: number,
    delegated_vesting_shares: string,
    guest_bloggers: any[],
    id: number,
    json_metadata: string,
    last_account_update: string,
    last_bandwidth_update: string,
    last_market_bandwidth_update: string,
    last_owner_update: string,
    last_post: string,
    last_root_post: string,
    last_vote_time: string,
    lifetime_bandwidth: string,
    lifetime_market_bandwidth: number,
    lifetime_vote_count: number,
    market_history: any[],
    memo_key: string,
    mined: boolean,
    name: string,
    next_vesting_withdrawal: string,
    other_history: any[],
    owner: any,
    post_count: number,
    post_history: any[],
    posting: any,
    posting_rewards: number,
    proxied_vsf_votes: any,
    proxy: string,
    received_vesting_shares: string,
    recovery_account: string,
    reputation: number,
    reset_account: string,
    reward_sbd_balance: string,
    reward_steem_balance: string,
    reward_vesting_balance: string,
    reward_vesting_steem: string,
    savings_balance: string,
    savings_sbd_balance: string,
    savings_sbd_last_interest_payment: string,
    savings_sbd_seconds: string,
    savings_sbd_seconds_last_update: string,
    savings_withdraw_requests: number,
    sbd_balance: string,
    sbd_last_interest_payment: string,
    sbd_seconds: string,
    sbd_seconds_last_update: string,
    tags_usage: any[],
    to_withdraw: number,
    transfer_history: any[],
    vesting_balance: string,
    vesting_shares: string,
    vesting_withdraw_rate: string,
    vote_history: any[],
    voting_power: number,
    withdraw_routes: number,
    withdrawn: number,
    witness_votes: any[],
    witnesses_voted_for: number,
}

export interface SteemPost {
    abs_rshares: string,
    active: string,
    active_votes: SteemVote[],
    allow_curation_rewards: boolean,
    allow_replies: boolean,
    allow_votes: boolean,
    author: string,
    author_reputation: string,
    author_rewards: number,
    beneficiaries: any,
    body: any,
    body_length: number,
    cashout_time: string,
    category: string,
    children: number,
    children_abs_rshares: string,
    created: string,
    curator_payout_value: string,
    depth: number,
    id: number,
    json_metadata: string,
    last_payout: string,
    last_update: string,
    max_accepted_payout: string,
    max_cashout_time: string,
    net_rshares: string,
    net_votes: number,
    parent_author: string,
    parent_permlink: string,
    pending_payout_value: string,
    percent_steem_dollars: number,
    permlink: string,
    promoted: string
    reblogged_by: any,
    replies: any,
    reward_weight: number,
    root_author: string,
    root_permlink: string,
    root_title: string,
    title: string,
    total_payout_value: string,
    total_pending_payout_value: string,
    total_vote_weight: number,
    url: string,
    vote_rshares: string
}